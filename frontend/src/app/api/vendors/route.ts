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
    const category = searchParams.get("category") || undefined;
    const location = searchParams.get("location") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    const directus = getDirectusClient();

    const filters: any = { status: { _eq: "active" } };

    if (location) {
      const [areaPartRaw, cityPartRaw] = location.includes("||")
        ? location.split("||")
        : location.split(",").map((p) => p.trim());
      const areaPart = areaPartRaw?.trim();
      const cityPart = cityPartRaw?.trim();
      if (areaPart && cityPart) {
        filters._and = [
          { city: { _icontains: cityPart } },
          { area: { _icontains: areaPart } },
        ];
      } else {
        filters._and = [
          { _or: [{ city: { _icontains: location } }, { area: { _icontains: location } }] },
        ];
      }
    }

    if (search) {
      filters._or = [
        { name: { _icontains: search } },
        { description: { _icontains: search } },
        { area: { _icontains: search } },
        { city: { _icontains: search } },
      ];
    }

    if (category) {
      const junctionRows = await directus.request(
        readItems("vendor_categories", {
          fields: ["vendors_id", "categories_id.slug", "categories_id.name"],
          limit: 200,
        })
      ) as any[];

      const matchingIds = junctionRows
        .filter((row: any) => {
          const slug = (row.categories_id?.slug || "").toLowerCase();
          const name = (row.categories_id?.name || "").toLowerCase();
          const term = category.toLowerCase();
          return slug === term || term.includes(slug) || name.includes(term) || term.includes(name);
        })
        .map((row: any) => row.vendors_id);

      if (matchingIds.length === 0) {
        return NextResponse.json({ data: [] });
      }
      filters.id = { _in: matchingIds };
    }

    const vendors = await directus.request(
      readItems("vendors", {
        filter: filters,
        fields: ["*", "categories.categories_id.*", "working_hours.*"],
        limit,
        offset,
      })
    );

    return NextResponse.json({ data: vendors });
  } catch (error) {
    console.error("[/api/vendors] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
