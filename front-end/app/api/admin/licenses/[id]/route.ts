//api/admin/licenses/[id]/route.ts
import { connect } from "@/dbConfig/dbConfig";
import BusinessLicense from "@/models/licenseModel";
import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/withErrorHandler";
import { NotFoundError, BadRequestError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  await connect();

  const parts = request.nextUrl.pathname.split("/");
  const id = parts[parts.length - 1];

  if (!id) {
    throw new BadRequestError("License id is required");
  }

  const license = await BusinessLicense.findById(id);

  if (!license) {
    throw new NotFoundError("License not found");
  }

  return Response.json({ success: true, data: license }, { status: 200 });
});
