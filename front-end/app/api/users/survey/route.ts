import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import Preference from "@/models/preferenceModel";
import jwt from "jsonwebtoken";
import Business from "@/models/businessModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || "";
    const decoded: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const businessId = decoded.businessId;

    const preference = await Preference.findOne({ businessId});
    if (!preference) {
      return NextResponse.json(
        { error: "Preferences not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(preference);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { surveyData, customTags } = reqBody;

    console.log(reqBody);

    const token = request.cookies.get("token")?.value || "";
    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    const businessId = decodedToken.businessId;

    //check if business exists
    const preference = await Preference.findOne({ businessId});
    if (preference) {
      return NextResponse.json(
        { error: "Preference already created" },
        { status: 400 }
      );
    }

    const newPreference = new Preference({
      businessId,
      primaryMarkets: surveyData.primaryMarkets,
      productCategories: surveyData.productCategories,
      materials: surveyData.materials,
      customTags,
    });

    const savedPreference = await newPreference.save();
    return NextResponse.json(savedPreference, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decodedToken: any = jwt.verify(token!, process.env.TOKEN_SECRET!);
    const businessId = decodedToken.businessId;

    const body = await req.json();
    const preferenceData = body.preference;

    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const updated = await Preference.findOneAndUpdate(
      { businessId },
      {
        materials: preferenceData.materials || [],
        productCategories: preferenceData.productCategories || [],
        primaryMarkets: preferenceData.regions || [],
        customTags: preferenceData.customTags || [],
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Preferences updated", updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}