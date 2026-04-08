import { NextRequest, NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";

function getDirectusClient() {
  const url = process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055";
  const token = process.env.DIRECTUS_TOKEN;
  return token
    ? createDirectus(url).with(rest()).with(staticToken(token))
    : createDirectus(url).with(rest());
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const directus = getDirectusClient();

    const response = await directus.request(
      readItems("vendors", {
        filter: { slug: { _eq: slug }, status: { _eq: "active" } },
        fields: ["*", "categories.categories_id.*", "working_hours.*", "reviews.*"],
        limit: 1,
      })
    );

    const vendor = (response as any[])[0] || null;
    if (!vendor) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    // Fetch enrichment data in parallel
    const [workingHours, reviews, employeesRaw] = await Promise.all([
      directus.request(
        readItems("working_hours", {
          filter: { vendor_id: { _eq: vendor.id } },
          fields: ["*"],
          sort: ["day_of_week"],
          limit: 50,
        })
      ),
      directus.request(
        readItems("reviews", {
          filter: { vendor_id: { _eq: vendor.id } },
          fields: ["*"],
          sort: ["-created_at"],
          limit: 100,
        })
      ),
      directus.request(
        readItems("employees", {
          filter: { vendor_id: { _eq: vendor.id }, status: { _eq: "active" } },
          fields: ["id"],
          limit: 100,
        })
      ),
    ]);

    const employeeIds = (employeesRaw as any[]).map((e) => e.id);
    let services: any[] = [];

    if (employeeIds.length > 0) {
      const employeeServices = await directus.request(
        readItems("employee_services", {
          filter: { employee_id: { _in: employeeIds }, is_active: { _eq: true } },
          fields: ["id", "employee_id", "name", "price", "description", "duration_minutes", "sort_order", "is_active"],
          sort: ["sort_order"],
          limit: 500,
        })
      );

      const seen = new Set<string>();
      services = (employeeServices as any[])
        .filter((s) => {
          if (seen.has(s.name)) return false;
          seen.add(s.name);
          return true;
        })
        .map((s) => ({
          id: s.id,
          vendor_id: vendor.id,
          name: s.name,
          description: s.description || "",
          duration: s.duration_minutes,
          price: Number(s.price),
          is_popular: false,
          status: s.is_active ? "active" : "inactive",
          sort_order: s.sort_order || 0,
        }));
    }

    return NextResponse.json({
      data: { ...vendor, working_hours: workingHours, reviews, services },
    });
  } catch (error) {
    console.error("[/api/vendor/[slug]] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}
