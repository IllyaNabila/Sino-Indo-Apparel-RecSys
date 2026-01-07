// src/lib/analytics/getDashboardAnalytics.ts
import mongoose, { FilterQuery } from "mongoose";
import type { Types } from "mongoose";
import Business from "@/models/businessModel";
import Product from "@/models/productModel";
import Conversation from "@/models/conversationModel";
import Membership from "@/models/conversationMembershipModel";
import Message from "@/models/messageModel";
import BusinessLicense from "@/models/licenseModel";
import Preference from "@/models/preferenceModel";

export type DashboardFilters = {
  country?: string;     // "all" | "china" | "indonesia" | ...
  region?: string;      // currently NOT stored in your schemas (kept for future)
  season?: string;      // "all" | "spring" | "summer" | "fall" | "winter"
  demographic?: string; // currently NOT stored in your schemas (kept for future)
};

type ChartDataset = { label: string; data: number[] };
type ChartData = { labels: string[]; datasets: ChartDataset[] };
type PieData = { labels: string[]; datasets: { label: string; data: number[] }[] };
type LeanBusinessDoc = {
  _id: Types.ObjectId;
  companyName?: string | null;
  country?: string | null;
  address?: string | null;
  role?: string | null;
  verified?: boolean | null;
};

type LeanConversationDoc = {
  productContext?: string | null;     // Conversation.productContext exists :contentReference[oaicite:0]{index=0}
  lastMessageAt?: Date | null;        // Conversation.lastMessageAt exists :contentReference[oaicite:1]{index=1}
};

type LeanLicenseDoc = {
  verificationStatus?: "pending" | "approved" | "rejected" | null; // enum exists :contentReference[oaicite:2]{index=2}
  updatedAt?: Date | null; // from timestamps :contentReference[oaicite:3]{index=3}
};

type LeanPreferenceDoc = {
  primaryMarkets_norm?: string[];        // defaults [] :contentReference[oaicite:4]{index=4}
  productCategories_norm?: string[];     // defaults [] :contentReference[oaicite:5]{index=5}
  materials_norm?: string[];             // defaults [] :contentReference[oaicite:6]{index=6}
};

type LeanMessageDoc = {
  senderId: Types.ObjectId;
  sentAt: Date; // default Date.now :contentReference[oaicite:7]{index=7}
};

interface LeanBusiness {
  _id: mongoose.Types.ObjectId;
  companyName?: string;
  country?: string;
  address?: string;
  role?: string;
  verified?: boolean;
}

interface LeanProduct {
  name?: string;
  businessId?: LeanBusiness;
  priceMin?: number;
  priceMax?: number;
  moq?: string;
  images?: string[];
}

export type DashboardAnalyticsResponse = {
  stats: {
    activeConnections: number;
    productViews: number; // proxy based on productContext conversations (since you don't have a view table)
    messages: number;     // unread count from Membership.unread
    revenue: number;      // no order schema yet -> 0
    meta: {
      unreadMessages: number;
      receivedLast30Days: number;
      notes: string[];
    };
  };
  recentActivity: Array<{
    type: "message" | "product" | "license";
    content: string;
    time: string;
    status: "new" | "inquiry" | "approved";
  }>;
  recommendedProducts: Array<{
    name: string;
    company: string;
    price: string;
    moq: string;
    image?: string;
  }>;
  recommendedCompanies: Array<{
    name: string;
    type: "Manufacturer" | "Importer";
    location: string;
    verified: boolean;
    products: number;
  }>;
  charts: {
    trends: ChartData;
    regional: PieData;
    seasonal: ChartData;
  };
};

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function humanizeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

function monthToSeason(month: number): "Spring" | "Summer" | "Fall" | "Winter" {
  // month is 1..12
  if ([3, 4, 5].includes(month)) return "Spring";
  if ([6, 7, 8].includes(month)) return "Summer";
  if ([9, 10, 11].includes(month)) return "Fall";
  return "Winter"; // 12,1,2
}

function seasonFilterToMonths(season: string | undefined): number[] | null {
  if (!season || season === "all") return null;
  if (season === "spring") return [3, 4, 5];
  if (season === "summer") return [6, 7, 8];
  if (season === "fall") return [9, 10, 11];
  if (season === "winter") return [12, 1, 2];
  return null;
}

/**
 * Dashboard analytics using your schemas:
 * - Active Connections: open conversations that include your businessId (Conversation.participants) :contentReference[oaicite:2]{index=2}
 * - Messages: sum of Membership.unread for your businessId :contentReference[oaicite:3]{index=3}
 * - "Product Views": proxy = count of conversations with productContext (since no view/inquiry schema yet) :contentReference[oaicite:4]{index=4}
 * - Revenue: 0 (no order schema)
 */
export async function getDashboardAnalytics(
  businessId: string,
  filters: DashboardFilters
): Promise<DashboardAnalyticsResponse> {
  const bid = toObjectId(businessId);

    const business = (await Business.findById(bid)
    .select({ role: 1, country: 1, address: 1, companyName: 1, verified: 1 })
    .lean()) as LeanBusinessDoc | null;

    const role = business?.role ?? null;
    const country = business?.country ?? null;
    const address = business?.address ?? null;
    
  // Country filter is possible because Business has country :contentReference[oaicite:6]{index=6}
  // const country = filters.country && filters.country !== "all" ? filters.country : null;

  // Season filter is derived from timestamps (you don't store season in DB)
  const monthsForSeason = seasonFilterToMonths(filters.season);

  // ---------- Stats ----------
  const [activeConversations, productContextConversations] = await Promise.all([
    Conversation.countDocuments({
      participants: bid,
      $or: [{ isEnded: { $ne: true } }, { isEnded: { $exists: false } }],
    }),
    Conversation.countDocuments({
      participants: bid,
      productContext: { $exists: true, $ne: "" },
    }),
  ]);

  const unreadAgg = await Membership.aggregate([
    { $match: { userId: bid } },
    { $group: { _id: null, unread: { $sum: "$unread" } } },
  ]);
  const unreadMessages = unreadAgg?.[0]?.unread ?? 0;

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const receivedLast30Days = await Message.countDocuments({
    receiverId: bid,
    sentAt: { $gte: since30d }, // Message.sentAt exists :contentReference[oaicite:7]{index=7}
  });

  const stats = {
    activeConnections: activeConversations,
    productViews: productContextConversations,
    messages: unreadMessages,
    revenue: 0,
    meta: {
      unreadMessages,
      receivedLast30Days,
      notes: [
        "Revenue is 0 because there is no order/payment schema yet.",
        '"Product Views" is estimated from conversations that have productContext (proxy for inquiries/views).',
        "Region & demographic filters are currently ignored because those fields are not stored in your schemas.",
      ],
    },
  };

  // ---------- Recent Activity ----------
  const latestMessages = await Message.find({ receiverId: bid })
    .sort({ sentAt: -1 })
    .limit(3)
    .select({ senderId: 1, sentAt: 1 })
    .lean();

  const senderIds = latestMessages.map((m) => m.senderId).filter(Boolean);
  const senders = await Business.find({ _id: { $in: senderIds } })
    .select({ companyName: 1 }) // Business.companyName :contentReference[oaicite:8]{index=8}
    .lean();

  const senderMap = new Map<string, string>(
    (senders as unknown as LeanBusiness[]).map((s) => [String(s._id), s.companyName ?? "A partner"])
  );

    const latestInquiryConv = (await Conversation.findOne({
    participants: bid,
    productContext: { $exists: true, $ne: "" },
    })
    .sort({ lastMessageAt: -1 })
    .select({ productContext: 1, lastMessageAt: 1 })
    .lean()) as LeanConversationDoc | null;


const latestLicense = (await BusinessLicense.findOne({ businessId: bid })
  .sort({ updatedAt: -1 })
  .select({ verificationStatus: 1, updatedAt: 1 })
  .lean()) as LeanLicenseDoc | null;

  const recentActivity: DashboardAnalyticsResponse["recentActivity"] = [];

  for (const m of latestMessages) {
    recentActivity.push({
      type: "message",
      content: `New message from ${senderMap.get(String(m.senderId)) ?? "a partner"}`,
      time: humanizeAgo(new Date(m.sentAt)),
      status: "new",
    });
  }

  if (latestInquiryConv?.productContext) {
    recentActivity.push({
      type: "product",
      content: `${latestInquiryConv.productContext} received a new inquiry`,
      time: latestInquiryConv.lastMessageAt
        ? humanizeAgo(new Date(latestInquiryConv.lastMessageAt))
        : "recently",
      status: "inquiry",
    });
  }

  if (latestLicense?.verificationStatus) {
    const approved = latestLicense.verificationStatus === "approved"; // enum exists :contentReference[oaicite:10]{index=10}
    recentActivity.push({
      type: "license",
      content: approved ? "Business license approved" : "Business license updated",
      time: latestLicense.updatedAt ? humanizeAgo(new Date(latestLicense.updatedAt)) : "recently",
      status: approved ? "approved" : "approved",
    });
  }

  // ---------- Recommendations (based on Preference + Product + Business role) ----------
  const pref = (await Preference.findOne({ businessId: bid })
  .select({ primaryMarkets_norm: 1, productCategories_norm: 1, materials_norm: 1 })
  .lean()) as LeanPreferenceDoc | null;

  // Opposite listing type (your products have listingType) :contentReference[oaicite:12]{index=12}
  const desiredListingType =
    role === "importer" ? "offer" : role === "manufacturer" ? "request" : null;

  const productMatch: FilterQuery<any> = {
    businessId: { $ne: bid }, // Product.businessId :contentReference[oaicite:13]{index=13}
  };
  if (desiredListingType) productMatch.listingType = desiredListingType;

  // preference matching (category/material)
  const categoryFilter = pref?.productCategories_norm?.length ? { $in: pref.productCategories_norm } : null;
  const materialFilter = pref?.materials_norm?.length ? { $in: pref.materials_norm } : null;

  if (categoryFilter || materialFilter) {
    productMatch.$or = [];
    if (categoryFilter) productMatch.$or.push({ category_norm: categoryFilter });
    if (materialFilter) productMatch.$or.push({ material_norm: materialFilter });
  }

  const matchedProducts = await Product.find(productMatch)
    .sort({ createdAt: -1 })
    .limit(6)
    .populate({ path: "businessId", select: "companyName" })
    .lean();
  //console.log("matchedProducts",matchedProducts)

  const recommendedProducts: DashboardAnalyticsResponse["recommendedProducts"] =
    (matchedProducts as unknown as LeanProduct[]).map((p) => ({
      name: p.name ?? "Unnamed product",
      company: p.businessId?.companyName ?? "Unknown company",
      price: p.priceMin && p.priceMax ? `$${p.priceMin}-${p.priceMax}` : "N/A", // priceMin/priceMax exist :contentReference[oaicite:14]{index=14}
      moq: p.moq ?? "N/A", // moq exists :contentReference[oaicite:15]{index=15}
      image: Array.isArray(p.images) && p.images.length ? p.images[0] : undefined, // images exist :contentReference[oaicite:16]{index=16}
    }));

  // Recommend companies: opposite role + verified + (optional) in preferred markets (mapped to Business.country)
  const oppositeRole =
    role === "importer" ? "manufacturer" : role === "manufacturer" ? "importer" : null;
  const oppositeCountry =
    country === "indonesia" ? "china" : country === "china" ? "indonesia" : null;

    //Build a MongoDB filter
  const companyMatch: FilterQuery<typeof Business> = { _id: { $ne: bid }, verified: true }; // Business.verified :contentReference[oaicite:17]{index=17}
  if (oppositeRole) companyMatch.role = oppositeRole;
  if (oppositeCountry) companyMatch.country = new RegExp(`^${oppositeCountry}$`, "i");

  // If user has primaryMarkets, restrict by them
  if (pref?.primaryMarkets_norm?.length) {
    companyMatch.address = { $in: pref.primaryMarkets_norm };
  }
 // console.log(companyMatch);

  //Fetch the companies
  const companies = await Business.find(companyMatch)
    .sort({ updatedAt: -1 })
    .limit(6)
    .lean();
  //console.log(companies);

  //Count products for each company
  const companyIds = companies.map((c: any) => c._id);
  const productCounts = await Product.aggregate([
    { $match: { businessId: { $in: companyIds } } },
    { $group: { _id: "$businessId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>(productCounts.map((r) => [String(r._id), r.count]));

  //Merge into final response shape
  const recommendedCompanies: DashboardAnalyticsResponse["recommendedCompanies"] =
    (companies as unknown as LeanBusiness[]).map((c) => ({
      name: c.companyName ?? "Unknown",
      type: c.role === "manufacturer" ? "Manufacturer" : "Importer",
      location: c.address ?? "Unknown",
      verified: !!c.verified,
      products: countMap.get(String(c._id)) ?? 0,
    }));
  //console.log(recommendedCompanies);

  // ---------- Charts ----------
  // Your UI expects TREND_DATA / REGION_DATA / SEASONAL_DATA shapes :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}

  // Trends: last 6 months, top 3 categories, filtered by partner country (via $lookup)
  const now = new Date();
  const start6m = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const trendRows = await Product.aggregate<{
    month: number;
    category: string;
    count: number;
  }>([
    { $match: { createdAt: { $gte: start6m } } },
    {
      $lookup: {
        from: "businesses",
        localField: "businessId",
        foreignField: "_id",
        as: "biz",
      },
    },
    { $unwind: "$biz" },
    ...(oppositeCountry ? [{ $match: { "biz.country": new RegExp(`^${oppositeCountry}$`, "i") } }] : []),
    ...(monthsForSeason
      ? [
          {
            $addFields: { m: { $month: "$createdAt" } },
          },
          { $match: { m: { $in: monthsForSeason } } },
        ]
      : []),
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, category: "$category" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        category: { $ifNull: ["$_id.category", "Unknown"] },
        count: 1,
      },
    },
  ]);
 // console.log(trendRows);

  // Build month labels = last 6 months
  const monthLabels: string[] = [];
  const monthNums: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString("en", { month: "short" }));
    monthNums.push(d.getMonth() + 1);
  }

  // top categories by total counts
  const totals = new Map<string, number>();
  for (const r of trendRows) totals.set(r.category, (totals.get(r.category) ?? 0) + r.count);
  const topCats = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

  const trends: ChartData = {
    labels: monthLabels,
    datasets: topCats.length
      ? topCats.map((cat) => ({
          label: cat,
          data: monthNums.map((m) => trendRows.find((r) => r.category === cat && r.month === m)?.count ?? 0),
        }))
      : [{ label: "No Data", data: monthNums.map(() => 0) }],
  };
  //console.log(trends);

  // Regional: you don’t store region; so we return distribution by Business.country (market share proxy)
  const countryDist = await Business.aggregate<{ address: string; count: number }>([
    { $match: oppositeCountry ? { country: new RegExp(`^${oppositeCountry}$`, "i") } : {} },
    { $group: { _id: { $ifNull: ["$address", "Unknown"] }, count: { $sum: 1 } } },
    { $project: { _id: 0, address: "$_id", count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);
  //console.log(countryDist);

  const regional: PieData = {
    labels: countryDist.length ? countryDist.map((r) => r.address) : ["No Data"],
    datasets: [{ label: "Market Share", data: countryDist.length ? countryDist.map((r) => r.count) : [1] }],
  };
  //console.log(regional);

  // Seasonal: counts per season for the same top categories
  const seasonalRows = await Product.aggregate<{ season: string; category: string; count: number }>([
    { $match: { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } }, // current year
    {
      $lookup: {
        from: "businesses",
        localField: "businessId",
        foreignField: "_id",
        as: "biz",
      },
    },
    { $unwind: "$biz" },
    ...(oppositeCountry ? [{ $match: { "biz.country": new RegExp(`^${oppositeCountry}$`, "i") } }] : []),
    {
      $addFields: { month: { $month: "$createdAt" } },
    },
    ...(monthsForSeason ? [{ $match: { month: { $in: monthsForSeason } } }] : []),
    {
      $project: {
        category: { $ifNull: ["$category", "Unknown"] },
        season: {
          $switch: {
            branches: [
              { case: { $in: ["$month", [3, 4, 5]] }, then: "Spring" },
              { case: { $in: ["$month", [6, 7, 8]] }, then: "Summer" },
              { case: { $in: ["$month", [9, 10, 11]] }, then: "Fall" },
            ],
            default: "Winter",
          },
        },
      },
    },
    {
      $group: {
        _id: { season: "$season", category: "$category" },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, season: "$_id.season", category: "$_id.category", count: 1 } },
  ]);
  //console.log(seasonalRows);

  const seasons = ["Spring", "Summer", "Fall", "Winter"] as const;
  const seasonal: ChartData = {
    labels: [...seasons],
    datasets: topCats.length
      ? topCats.map((cat) => ({
          label: cat,
          data: seasons.map((s) => seasonalRows.find((r) => r.category === cat && r.season === s)?.count ?? 0),
        }))
      : [{ label: "No Data", data: seasons.map(() => 0) }],
  };
  //console.log(seasonal);

  return {
    stats,
    recentActivity: recentActivity.slice(0, 6),
    recommendedProducts,
    recommendedCompanies,
    charts: { trends, regional, seasonal },
  };
}
