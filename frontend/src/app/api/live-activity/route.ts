import { NextRequest, NextResponse } from "next/server";

const METRIC_KEY = "live_activity";

async function getDirectusUrls() {
  const urls = [];
  if (process.env.DIRECTUS_INTERNAL_URL) urls.push(process.env.DIRECTUS_INTERNAL_URL);
  if (process.env.NEXT_PUBLIC_DIRECTUS_URL) urls.push(process.env.NEXT_PUBLIC_DIRECTUS_URL);
  urls.push("http://directus:8055");
  // urls.push("http://localhost:8055");
  
  // Remove duplicates and empty values
  return Array.from(new Set(urls.filter(Boolean)));
}

async function loginToDirectus() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("CRITICAL: Missing Directus credentials (ADMIN_EMAIL/ADMIN_PASSWORD)");
    throw new Error("Missing Directus credentials for live activity updates.");
  }

  const urls = await getDirectusUrls();
  let lastError = null;

  for (const url of urls) {
    try {
      console.log(`Attempting Directus login at: ${url}/auth/login`);
      const loginResponse = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        // Short timeout to avoid hanging
        signal: AbortSignal.timeout(5000),
      });

      if (loginResponse.ok) {
        const loginPayload = await loginResponse.json();
        const token = loginPayload?.data?.access_token;
        if (token) {
          return { token, url };
        }
      } else {
        const msg = await loginResponse.text();
        console.warn(`Login failed at ${url}: ${msg}`);
        lastError = new Error(`Directus login failed at ${url}: ${msg}`);
      }
    } catch (err) {
      console.warn(`Connection failed to ${url}:`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to login to Directus with any available URL");
}

async function getDirectusContext() {
  const staticToken = process.env.DIRECTUS_TOKEN;
  const urls = await getDirectusUrls();

  if (staticToken && !staticToken.includes("your-directus-static-token")) {
    // With a static token, we still need to find a working URL
    for (const url of urls) {
      try {
        const testRes = await fetch(`${url}/server/ping`, { signal: AbortSignal.timeout(2000) });
        if (testRes.ok) return { token: staticToken, url };
      } catch (e) {}
    }
  }

  return loginToDirectus();
}

async function readMetricWithResponse(token: string, url: string) {
  return fetch(
    `${url}/items/app_metrics?filter[metric_key][_eq]=${METRIC_KEY}&fields=id,metric_key,appointments_booked,updated_at&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
}

async function readMetric(token: string, url: string) {
  const response = await readMetricWithResponse(token, url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to load live activity: ${message}`);
  }
  const payload = await response.json();
  return payload?.data?.[0] || null;
}

async function updateMetricWithResponse(token: string, url: string, id: string, appointmentsBooked: number) {
  return fetch(`${url}/items/app_metrics/${id}?fields=id,appointments_booked,updated_at`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      appointments_booked: appointmentsBooked,
      updated_at: new Date().toISOString(),
    }),
    cache: "no-store",
  });
}

async function updateMetric(token: string, url: string, id: string, appointmentsBooked: number) {
  const response = await updateMetricWithResponse(token, url, id, appointmentsBooked);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to update live activity: ${message}`);
  }

  const payload = await response.json();
  return payload?.data || null;
}

export async function GET() {
  try {
    let { token, url } = await getDirectusContext();
    let response = await readMetricWithResponse(token, url);

    if (response.status === 401 || response.status === 403) {
      const auth = await loginToDirectus();
      token = auth.token;
      url = auth.url;
      response = await readMetricWithResponse(token, url);
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to load live activity: ${message}`);
    }

    const payload = await response.json();
    const metric = payload?.data?.[0] || null;

    if (!metric) {
      return NextResponse.json(
        { error: "Live activity metric not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appointmentsBooked: Number(metric.appointments_booked || 0),
      updatedAt: metric.updated_at || null,
    });
  } catch (error) {
    console.error("Live activity GET failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load live activity",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const incrementBy = Math.max(1, Math.min(10, Number(body?.incrementBy || 1)));

    let { token, url } = await getDirectusContext();
    let response = await readMetricWithResponse(token, url);

    if (response.status === 401 || response.status === 403) {
      const auth = await loginToDirectus();
      token = auth.token;
      url = auth.url;
      response = await readMetricWithResponse(token, url);
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to load live activity: ${message}`);
    }

    const payload = await response.json();
    const metric = payload?.data?.[0] || null;

    if (!metric?.id) {
      return NextResponse.json(
        { error: "Live activity metric not found." },
        { status: 404 }
      );
    }

    const nextValue = Number(metric.appointments_booked || 0) + incrementBy;
    let updateResponse = await updateMetricWithResponse(token, url, metric.id, nextValue);
    if (updateResponse.status === 401 || updateResponse.status === 403) {
      const auth = await loginToDirectus();
      token = auth.token;
      url = auth.url;
      updateResponse = await updateMetricWithResponse(token, url, metric.id, nextValue);
    }

    if (!updateResponse.ok) {
      const message = await updateResponse.text();
      throw new Error(`Failed to update live activity: ${message}`);
    }

    const updatePayload = await updateResponse.json();
    const updatedMetric = updatePayload?.data || null;

    return NextResponse.json({
      appointmentsBooked: Number(updatedMetric?.appointments_booked || nextValue),
      updatedAt: updatedMetric?.updated_at || new Date().toISOString(),
      incrementBy,
    });
  } catch (error) {
    console.error("Live activity POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update live activity",
      },
      { status: 500 }
    );
  }
}
