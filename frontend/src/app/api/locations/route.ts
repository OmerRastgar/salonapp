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
    const data = await directus.request(
      readItems("locations", {
        filter: { status: { _eq: "active" } },
        sort: ["sort_order"],
        fields: ["*"],
      })
    );
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[/api/locations] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
