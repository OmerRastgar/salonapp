import { NextRequest, NextResponse } from "next/server";

const directusUrl =
  process.env.DIRECTUS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  "http://directus:8055";

async function loginToDirectus() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing Directus credentials for booking requests.");
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

  const payload = await loginResponse.json();
  return payload?.data?.access_token as string;
}

async function getToken() {
  const staticToken = process.env.DIRECTUS_TOKEN;
  if (staticToken && !staticToken.includes("your-directus-static-token")) {
    return staticToken;
  }

  return loginToDirectus();
}

async function withFallback(
  makeRequest: (token: string) => Promise<Response>
) {
  let token = await getToken();
  let response = await makeRequest(token);

  if (response.status === 401 || response.status === 403) {
    token = await loginToDirectus();
    response = await makeRequest(token);
  }

  return response;
}

async function publicRequest(url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!employeeId || !start || !end) {
      return NextResponse.json(
        { error: "Missing employeeId, start, or end." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      "filter[employee_id][_eq]": employeeId,
      "filter[start_datetime][_gte]": start,
      "filter[start_datetime][_lte]": end,
      "filter[status][_nin]": "cancelled",
      sort: "start_datetime",
      fields: "id,employee_id,vendor_id,employee_service_id,start_datetime,end_datetime,status,amount,notes,created_at",
      limit: "-1",
    });

    let response = await publicRequest(`${directusUrl}/items/bookings?${params.toString()}`);
    if (response.status === 401 || response.status === 403) {
      response = await withFallback((token) =>
        fetch(`${directusUrl}/items/bookings?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        })
      );
    }

    if (!response.ok) {
      const errorPayload = await response.text();
      return NextResponse.json(
        { error: errorPayload || "Failed to load bookings" },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Bookings GET failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let response = await publicRequest(`${directusUrl}/items/bookings?fields=id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status === 401 || response.status === 403) {
      response = await withFallback((token) =>
        fetch(`${directusUrl}/items/bookings?fields=id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        })
      );
    }

    if (!response.ok) {
      const errorPayload = await response.text();
      return NextResponse.json(
        { error: errorPayload || "Failed to create booking" },
        { status: response.status }
      );
    }

    const text = await response.text();
    const payload = text ? JSON.parse(text) : { data: null };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Bookings POST failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    );
  }
}
