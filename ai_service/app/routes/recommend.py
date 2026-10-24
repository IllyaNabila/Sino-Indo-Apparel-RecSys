# ai_service\app\routes\recommend.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from ..db import products_col, businesses_col, profiles_col, preferences_col   # your collections
from ..services.embeddings import get_embedding
from ..services.scoring import (
    cosine_similarity,
    hard_match_score,
    preference_score,
    final_score,
)
from bson import ObjectId

router = APIRouter()

def _norm(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    s = str(s).strip().lower()
    return s or None

class RecommendIn(BaseModel):
    query_text: str          # cleaned
    query_material: Optional[str] = None
    query_category: Optional[str] = None
    query_location: Optional[str] = None
    query_tag: Optional[str] = None
    userId: str
    userRole: Optional[str] = None  # "importer" or "manufacturer"
    top_k: int = 10
    strong_threshold: float = 0.55  # can tune


    @validator("query_text", pre=True)
    def clean_query_text(cls, v):
        # keep it readable but trimmed
        return str(v).strip()

    @validator("query_material", "query_category", "query_location", "query_tag", pre=True)
    def normalize_filters(cls, v):
        return _norm(v)

    @validator("userRole", pre=True)
    def normalize_role(cls, v):
        return _norm(v)

class MatchOut(BaseModel):
    productId: str
    businessId: str
    name: str
    material: Optional[str]
    category: Optional[str]
    country: Optional[str]
    score: float
    similarity: float
    hard: float
    pref: float
    explanation: Optional[str] = None


class RecommendOut(BaseModel):
    matches: List[MatchOut]
    fallbackMode: str  # "none" | "weakSemantic" | "preference" | "relaxed"


def _fetch_user_prefs(user_id: str) -> Dict[str, Any]:
    preference = preferences_col.find_one({"businessId": ObjectId(user_id)}) or {}
    return {
        "primaryMarkets": preference.get("primaryMarkets_norm", []),
        "productCategories": preference.get("productCategories_norm", []),
        "materials": preference.get("materials_norm", []),
        "customTags": preference.get("customTags_norm", []),
    }


def _fetch_products_strict(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    # vv python dict that will be used as a mongodb query filter. the filter especially finds documents where embedding is exist and not null  
    mongo_filter: Dict[str, Any] = {"embedding": {"$exists": True, "$ne": None}} 
    # Convert string filters to case-insensitive regex
    for key, value in filters.items():
        if isinstance(value, str):  # If the filter value is a string
            mongo_filter[key] = {"$regex": f"{value}", "$options": "i"}  # Case-insensitive regex
        else:
            mongo_filter[key] = value  # Keep non-string filters as is
    print("mongo_filter", mongo_filter)
    # vv search the products collection with the given query filter, get all matching documents, convert them to a python list and return that list
    return list(products_col.find(mongo_filter)) 


def _fetch_products_relaxed(base_filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Relax material/category constraints: remove them if present.
    """
    relaxed = {k: v for k, v in base_filters.items() if k not in ("material_norm", "category_norm")}
    return list(products_col.find({"embedding": {"$exists": True, "$ne": None}, **relaxed}))

"""
@router.post("/recommend", response_model=RecommendOut)
def recommend(payload: RecommendIn):

    try:
        # 1) Embed query (semantic meaning)
        query_vec = get_embedding(payload.query_text)
        print(payload.query_text)

        # 2) Load user preferences
        user_prefs = _fetch_user_prefs(payload.userId)
        print(payload.userId)
        print("user_prefs", user_prefs)

        # 3) Build base filters (role-based + strict)
        base_filters: Dict[str, Any] = {}
        """"""
        if payload.userRole == "importer":
            base_filters["listingType"] = "offer"
        elif payload.userRole == "manufacturer":
            base_filters["listingType"] = "request"
        
        # Handle Location Filter (Pre-fetch businesses in that location)
        if payload.query_location:
            # Case-insensitive regex for location
            loc_regex = {"$regex": payload.query_location, "$options": "i"}
            
            # Find businesses matching the location (country, city, or address)
            matching_businesses = list(businesses_col.find({
                "$or": [
                    {"country": loc_regex},
                    {"city": loc_regex},
                    {"address": loc_regex}
                ]
            }, {"_id": 1}))
            
            # Extract IDs and add to filters
            loc_biz_ids = [b["_id"] for b in matching_businesses]
            if loc_biz_ids:
                base_filters["businessId"] = {"$in": loc_biz_ids}
            else:
                # No location hits; avoid over-filtering so we can still return non-location results
                print("No businesses matched location filter; skipping location constraint.")

        if payload.query_material:
            base_filters["material_norm"] = payload.query_material
        if payload.query_category:
            base_filters["category_norm"] = payload.query_category
        print("base_filters", base_filters)
        

        # ---------- PASS 1: STRICT + STRONG MATCHES ----------
        strict_products = _fetch_products_strict(base_filters)
        if strict_products:
            print("strict_products", len(strict_products))


        products_by_id = {str(p["_id"]): p for p in strict_products}
        business_ids = list({p["businessId"] for p in strict_products})
        if business_ids:
            print("business_ids")
        businesses = {
            str(b["_id"]): b for b in businesses_col.find({"_id": {"$in": business_ids}})
        }
        if businesses:
            print("businesses")

        scored: List[Dict[str, Any]] = []

        for p in strict_products:
            prod_id = str(p["_id"])
            biz = businesses.get(str(p["businessId"]))
            sim = cosine_similarity(query_vec, p["embedding"])
            hard = hard_match_score(p, payload.query_material, payload.query_category)
            pref = preference_score(p, biz, user_prefs)
            score = final_score(sim, hard, pref)

            scored.append(
                {
                    "product": p,
                    "business": biz,
                    "score": score,
                    "similarity": sim,
                    "hard_match_score": hard,
                    "preference_score": pref,
                    "explanation": "Strict match with material/category filters.",
                }
            )

        scored.sort(key=lambda x: x["score"], reverse=True)

        strong_matches = [s for s in scored if s["score"] >= payload.strong_threshold]

        if strong_matches:
            return RecommendOut(
                matches=[
                    MatchOut(
                        productId=str(s["product"]["_id"]),
                        businessId=str(s["product"]["businessId"]),
                        name=s["product"]["name"],
                        material=s["product"].get("material"),
                        category=s["product"].get("category"),
                        country=(s["business"] or {}).get("country"),
                        score=s["score"],
                        similarity=s["similarity"],
                        hard=s["hard_match_score"],
                        pref=s["preference_score"],
                        explanation=s["explanation"],
                    )
                    for s in strong_matches[: payload.top_k]
                ],
                fallbackMode="none",
            )

        # ---------- PASS 2: SAME FILTERS, BUT ACCEPT WEAK SEMANTIC ----------
        if scored:  # we have some candidates but low scores
            return RecommendOut(
                matches=[
                    MatchOut(
                        productId=str(s["product"]["_id"]),
                        businessId=str(s["product"]["businessId"]),
                        name=s["product"]["name"],
                        material=s["product"].get("material"),
                        category=s["product"].get("category"),
                        country=(s["business"] or {}).get("country"),
                        score=s["score"],
                        similarity=s["similarity"],
                        hard=s["hard_match_score"],
                        pref=s["preference_score"],
                        explanation="Closest semantic matches under strict filters.",
                    )
                    for s in scored[: payload.top_k]
                ],
                fallbackMode="weakSemantic",
            )

        # ---------- PASS 3: RELAXED FILTERS + PREFERENCES ----------
        relaxed_products = _fetch_products_relaxed(base_filters)

        if not relaxed_products:
            # absolutely nothing in DB with embeddings, fail-safe
            return RecommendOut(matches=[], fallbackMode="relaxed")

        business_ids = list({p["businessId"] for p in relaxed_products})
        businesses = {
            str(b["_id"]): b for b in businesses_col.find({"_id": {"$in": business_ids}})
        }

        scored_relaxed: List[Dict[str, Any]] = []

        for p in relaxed_products:
            biz = businesses.get(str(p["businessId"]))
            sim = cosine_similarity(query_vec, p["embedding"])
            hard = hard_match_score(p, payload.query_material, payload.query_category)
            pref = preference_score(p, biz, user_prefs)
            score = final_score(sim, hard, pref)

            scored_relaxed.append(
                {
                    "product": p,
                    "business": biz,
                    "score": score,
                    "similarity": sim,
                    "hard_match_score": hard,
                    "preference_score": pref,
                    "explanation": "Relaxed filters; ranked by semantic relevance and preferences.",
                }
            )

        scored_relaxed.sort(key=lambda x: x["score"], reverse=True)
        # Your existing logic here...
        return RecommendOut(
            matches=[
                MatchOut(
                    productId=str(s["product"]["_id"]),
                    businessId=str(s["product"]["businessId"]),
                    name=s["product"]["name"],
                    material=s["product"].get("material"),
                    category=s["product"].get("category"),
                    country=(s["business"] or {}).get("country"),
                    score=s["score"],
                    similarity=s["similarity"],
                    hard=s["hard_match_score"],
                    pref=s["preference_score"],
                    explanation=s["explanation"],
                )
                for s in scored_relaxed[: payload.top_k]
            ],
            fallbackMode="preference" if scored else "relaxed",
        )
    except Exception as e:
        print(f"Error in /recommend: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
"""

@router.post("/recommend", response_model=RecommendOut)
def recommend(payload: RecommendIn):
    try:
        query_vec = get_embedding(payload.query_text)

        # Normalize once (align with *_norm fields)
        qm = (payload.query_material or "").strip().lower() or None
        qc = (payload.query_category or "").strip().lower() or None
        ql = (payload.query_location or "").strip().lower() or None
        qt = (payload.query_tag or "").strip().lower() or None

        user_prefs = _fetch_user_prefs(payload.userId)

        # Base filters (always applied)
        base_filters: Dict[str, Any] = {}

        if payload.userRole == "importer":
            base_filters["listingType"] = "offer"
        elif payload.userRole == "manufacturer":
            base_filters["listingType"] = "request"

        # OPTIONAL: strict should only run if user gave constraints beyond role
        has_strict_constraints = any([qm, qc, ql, qt])

        # Location -> businessId constraint (hard filter only if we find businesses)
        if ql:
            loc_regex = {"$regex": ql, "$options": "i"}
            matching_businesses = list(
                businesses_col.find(
                    {"$or": [{"country": loc_regex}, {"city": loc_regex}, {"address": loc_regex}]},
                    {"_id": 1},
                )
            )
            loc_biz_ids = [b["_id"] for b in matching_businesses]
            if loc_biz_ids:
                base_filters["businessId"] = {"$in": loc_biz_ids}
            else:
                # If user asked location but nothing matches, treat strict as empty
                # so we fall into relaxed instead of returning everything
                has_strict_constraints = True
                base_filters["businessId"] = {"$in": []}

        # Strict constraints (exact match because fields are *_norm already)
        if qm:
            base_filters["material_norm"] = qm
        if qc:
            base_filters["category_norm"] = qc

        # Tag constraint: only if you store description_norm and want strict filter
        if qt:
            base_filters["description_norm"] = {"$regex": qt, "$options": "i"}

        # ---------------- PASS 1 + 2: STRICT ONLY WHEN CONSTRAINTS EXIST ----------------
        strict_products: List[Dict[str, Any]] = []
        if has_strict_constraints:
            strict_products = _fetch_products_strict(base_filters)
        else:
            strict_products = []  # <-- this is the key: strict becomes empty on purpose

        scored: List[Dict[str, Any]] = []

        if strict_products:
            business_ids = list({p["businessId"] for p in strict_products})
            businesses = {
                str(b["_id"]): b
                for b in businesses_col.find({"_id": {"$in": business_ids}})
            }

            for p in strict_products:
                biz = businesses.get(str(p["businessId"]))
                sim = cosine_similarity(query_vec, p["embedding"])
                hard = hard_match_score(p, qm, qc)
                pref = preference_score(p, biz, user_prefs)
                score = final_score(sim, hard, pref)

                scored.append(
                    {
                        "product": p,
                        "business": biz,
                        "score": score,
                        "similarity": sim,
                        "hard_match_score": hard,
                        "preference_score": pref,
                        "explanation": "Strict match with constraints (material/category/location/tag).",
                    }
                )

            scored.sort(key=lambda x: x["score"], reverse=True)

            strong_matches = [s for s in scored if s["score"] >= payload.strong_threshold]
            if strong_matches:
                return RecommendOut(
                    matches=[
                        MatchOut(
                            productId=str(s["product"]["_id"]),
                            businessId=str(s["product"]["businessId"]),
                            name=s["product"]["name"],
                            material=s["product"].get("material"),
                            category=s["product"].get("category"),
                            country=(s["business"] or {}).get("country"),
                            score=s["score"],
                            similarity=s["similarity"],
                            hard=s["hard_match_score"],
                            pref=s["preference_score"],
                            explanation=s["explanation"],
                        )
                        for s in strong_matches[: payload.top_k]
                    ],
                    fallbackMode="none",
                )

            # PASS 2: strict candidates exist but not strong enough
            return RecommendOut(
                matches=[
                    MatchOut(
                        productId=str(s["product"]["_id"]),
                        businessId=str(s["product"]["businessId"]),
                        name=s["product"]["name"],
                        material=s["product"].get("material"),
                        category=s["product"].get("category"),
                        country=(s["business"] or {}).get("country"),
                        score=s["score"],
                        similarity=s["similarity"],
                        hard=s["hard_match_score"],
                        pref=s["preference_score"],
                        explanation="Closest semantic matches under strict constraints.",
                    )
                    for s in scored[: payload.top_k]
                ],
                fallbackMode="weakSemantic",
            )

        # ---------------- PASS 3: RELAXED (DEFAULT WHEN STRICT EMPTY) ----------------
        relaxed_products = _fetch_products_relaxed(base_filters)

        if not relaxed_products:
            return RecommendOut(matches=[], fallbackMode="relaxed")

        business_ids = list({p["businessId"] for p in relaxed_products})
        businesses = {
            str(b["_id"]): b for b in businesses_col.find({"_id": {"$in": business_ids}})
        }

        scored_relaxed: List[Dict[str, Any]] = []
        for p in relaxed_products:
            biz = businesses.get(str(p["businessId"]))
            sim = cosine_similarity(query_vec, p["embedding"])
            hard = hard_match_score(p, qm, qc)  # will be 0 if qm/qc None
            pref = preference_score(p, biz, user_prefs)
            score = final_score(sim, hard, pref)

            scored_relaxed.append(
                {
                    "product": p,
                    "business": biz,
                    "score": score,
                    "similarity": sim,
                    "hard_match_score": hard,
                    "preference_score": pref,
                    "explanation": "Relaxed ranking by semantic relevance + preferences.",
                }
            )

        scored_relaxed.sort(key=lambda x: x["score"], reverse=True)

        return RecommendOut(
            matches=[
                MatchOut(
                    productId=str(s["product"]["_id"]),
                    businessId=str(s["product"]["businessId"]),
                    name=s["product"]["name"],
                    material=s["product"].get("material"),
                    category=s["product"].get("category"),
                    country=(s["business"] or {}).get("country"),
                    score=s["score"],
                    similarity=s["similarity"],
                    hard=s["hard_match_score"],
                    pref=s["preference_score"],
                    explanation=s["explanation"],
                )
                for s in scored_relaxed[: payload.top_k]
            ],
            fallbackMode="relaxed",
        )

    except Exception as e:
        print(f"Error in /recommend: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
