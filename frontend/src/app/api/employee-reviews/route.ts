import { NextRequest, NextResponse } from "next/server";

const directusUrl =
  process.env.DIRECTUS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  "http://directus:8055";

async function loginToDirectus() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing Directus credentials for employee review submission.");
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

async function createEmployeeReview(token: string, body: any) {
  return fetch(`${directusUrl}/items/employee_reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      employee_id: body.employee_id,
      customer_name: body.customer_name,
      customer_email: body.customer_email || null,
      rating: body.rating,
      comment: body.comment,
      status: body.status || "published",
    }),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const staticToken = process.env.DIRECTUS_TOKEN;
    let createResponse =
      staticToken ? await createEmployeeReview(staticToken, body) : null;

    if (!createResponse || createResponse.status === 401 || createResponse.status === 403) {
      const accessToken = await loginToDirectus();
      createResponse = await createEmployeeReview(accessToken, body);
    }

    if (!createResponse.ok) {
      const errorPayload = await createResponse.text();
      return NextResponse.json(
        { error: errorPayload || "Failed to create employee review" },
        { status: createResponse.status }
      );
    }

    const payload = await createResponse.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Employee review route failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create employee review" },
      { status: 500 }
    );
  }
}
