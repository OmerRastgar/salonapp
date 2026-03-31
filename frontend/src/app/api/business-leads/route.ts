import { NextRequest, NextResponse } from "next/server";

const directusUrl =
  process.env.DIRECTUS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  "http://directus:8055";

async function loginToDirectus() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing Directus credentials for business lead submission.");
  }

  const loginResponse = await fetch(`${directusUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!loginResponse.ok) {
    const message = await loginResponse.text();
    throw new Error(`Directus login failed: ${message}`);
  }

  const loginPayload = await loginResponse.json();
  return loginPayload?.data?.access_token as string;
}

async function createBusinessLead(token: string, body: any) {
  return fetch(`${directusUrl}/items/business_leads?fields=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      business_name: body.business_name,
      contact_person: body.contact_person,
      phone: body.phone,
      email: body.email,
      category: body.category,
      city: body.city,
    }),
    cache: "no-store",
  });
}

async function createBusinessLeadPublic(body: any) {
  return fetch(`${directusUrl}/items/business_leads?fields=id`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: body.business_name,
      contact_person: body.contact_person,
      phone: body.phone,
      email: body.email,
      category: body.category,
      city: body.city,
    }),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['business_name', 'contact_person', 'phone', 'email', 'category', 'city'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    let createResponse = await createBusinessLeadPublic(body);

    if (!createResponse.ok && (createResponse.status === 401 || createResponse.status === 403)) {
      const staticToken = process.env.DIRECTUS_TOKEN;
      createResponse =
        staticToken ? await createBusinessLead(staticToken, body) : createResponse;
    }

    if (!createResponse.ok && (createResponse.status === 401 || createResponse.status === 403)) {
      const accessToken = await loginToDirectus();
      createResponse = await createBusinessLead(accessToken, body);
    }

    if (!createResponse.ok) {
      const errorPayload = await createResponse.text();
      return NextResponse.json(
        { error: errorPayload || "Failed to create business lead" },
        { status: createResponse.status }
      );
    }

    const text = await createResponse.text();
    const payload = text ? JSON.parse(text) : { data: null };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Business lead route failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create business lead" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
