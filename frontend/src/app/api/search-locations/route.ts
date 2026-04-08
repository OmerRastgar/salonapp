import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";

function getDirectusClient() {
  const url = process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055";
  const token = process.env.DIRECTUS_TOKEN;
  return token
    ? createDirectus(url).with(rest()).with(staticToken(token))
    : createDirectus(url).with(rest());
}

export async function GET() {
  try {
    const directus = getDirectusClient();

    const [locations, vendors] = await Promise.all([
      directus.request(readItems("locations", { filter: { status: { _eq: "active" } }, sort: ["sort_order"], fields: ["id", "name", "slug"] })),
      directus.request(readItems("vendors", { filter: { status: { _eq: "active" } }, fields: ["id", "city", "area"], sort: ["city", "area"], limit: 500 })),
    ]);

    return NextResponse.json({ locations, vendors });
  } catch (error) {
    console.error("[/api/search-locations] Error:", error);
    return NextResponse.json({ locations: [], vendors: [] }, { status: 500 });
  }
}
