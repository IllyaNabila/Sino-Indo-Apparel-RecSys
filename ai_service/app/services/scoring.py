# ai_service\app\services\scoring.py
import numpy as np
from typing import List, Dict, Any, Optional

def cosine_similarity(query_vec: List[float], prod_vec: List[float]) -> float:
    q = np.array(query_vec, dtype=float)
    p = np.array(prod_vec, dtype=float)
    q_norm = q / (np.linalg.norm(q) + 1e-9)
    p_norm = p / (np.linalg.norm(p) + 1e-9)
    return float(q_norm @ p_norm)


def preference_score(
    product: Dict[str, Any],
    business: Optional[Dict[str, Any]],
    user_prefs: Dict[str, Any],
) -> float:
    """
    Returns a small bonus score in [0, 1] based on preference matches.
    """
    score = 0.0

    # weights you can tune
    W_MATERIAL_PREF = 0.15
    W_CATEGORY_PREF = 0.15
    W_MARKET_PREF = 0.2
    W_TAG_PREF = 0.05
    
    print("preference_score:")

    if product.get("material_norm") in user_prefs["materials"]:
        print("user_prefs query_material:", user_prefs.get("materials"))
        print("product material_norm:", product.get("material_norm"))
    if (
        product.get("category_norm") in user_prefs["productCategories"]
    ):
        print("user_prefs productCategories:", user_prefs.get("productCategories"))
        print("product category_norm:", product.get("category_norm"))
    if business and user_prefs.get("primaryMarkets"):
        print("business country:", business.get("address"))
        print("user_prefs primaryMarkets:", user_prefs["primaryMarkets"])
    if product.get("description_norm", "") and user_prefs.get("customTags"):
        print("prod_tags:", product.get("description_norm", ""))
        print("pref_tags:", user_prefs.get("customTags") )

    # materials preference
    if product.get("material_norm") in user_prefs["materials"]:
        score += W_MATERIAL_PREF

    # category preference
    if (
        product.get("category_norm") in user_prefs["productCategories"]
    ):
        score += W_CATEGORY_PREF

    # primary markets vs business country
    if business and user_prefs.get("primaryMarkets"):
        if business.get("address") in user_prefs["primaryMarkets"]:
            score += W_MARKET_PREF

    # custom tags overlap (if you store tags on product description)
    prod_description = product.get("description_norm", "")
    pref_tags = user_prefs.get("customTags") or []
    if prod_description and pref_tags:
        overlap = len([tag for tag in pref_tags if tag in prod_description])
        score += min(overlap * W_TAG_PREF, W_TAG_PREF * 3)  # cap bonus

    return score


def hard_match_score(
    product: Dict[str, Any],
    query_material: Optional[str],
    query_category: Optional[str],
) -> float:
    """
    Adds bonus if product strictly matches query material/category.
    """
    score = 0.0
    W_MATERIAL = 0.1
    W_CATEGORY = 0.1
    print("hard_match_score:")
    if query_material and product.get("material_norm"):
        print("query_material:", query_material)
        print("product material_norm:", product.get("material_norm"))

    if query_material and product.get("material_norm") == query_material:
        score += W_MATERIAL

    if query_category and product.get("category_norm"):
        print("query_category:", query_category)
        print("product category_norm:", product.get("category_norm"))

    if query_category and product.get("category_norm") == query_category:
        score += W_CATEGORY

    return score


def final_score(
    base_similarity: float,
    hard_score: float,
    pref_score: float,
) -> float:
    """
    Combine semantic sim + rule-based bonuses.
    You can adjust the weight of similarity vs rules here.
    """
    W_SIM = 0.65
    W_HARD = 0.2
    W_PREF = 0.15

    return (W_SIM * base_similarity) + (W_HARD * hard_score) + (W_PREF * pref_score)
