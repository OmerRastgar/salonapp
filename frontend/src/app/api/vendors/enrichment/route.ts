import { NextRequest, NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";

function getDirectusClient() {
  const url = process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055";
  const token = process.env.DIRECTUS_TOKEN;
  return token
    ? createDirectus(url).with(rest()).with(staticToken(token))
    : createDirectus(url).with(rest());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const vendorIds = searchParams.get("vendorIds")?.split(",").filter(Boolean) || [];
    const employeeIds = searchParams.get("employeeIds")?.split(",").filter(Boolean) || [];

    const directus = getDirectusClient();

    if (type === "working_hours" && vendorIds.length > 0) {
      const data = await directus.request(
        readItems("working_hours", {
          filter: { vendor_id: { _in: vendorIds } },
          fields: ["*"],
          limit: 500,
        })
      );
      return NextResponse.json({ data });
    }

    if (type === "employees" && vendorIds.length > 0) {
      const data = await directus.request(
        readItems("employees", {
          filter: { vendor_id: { _in: vendorIds }, status: { _eq: "active" } },
          fields: ["id", "vendor_id"],
          limit: 500,
        })
      );
      return NextResponse.json({ data });
    }

    if (type === "employee_services" && employeeIds.length > 0) {
      const data = await directus.request(
        readItems("employee_services", {
          filter: { employee_id: { _in: employeeIds }, is_active: { _eq: true } },
          fields: ["id", "employee_id", "name", "price", "is_active", "description", "duration_minutes", "sort_order"],
          sort: ["sort_order"],
          limit: 1000,
        })
      );
      return NextResponse.json({ data });
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("[/api/vendors/enrichment] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Enrichment fetch failed" },
      { status: 500 }
    );
  }
}
