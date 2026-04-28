import { NextResponse } from "next/server";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || "http://api:8000";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();

  const apiResponse = await fetch(`${API_INTERNAL_URL}/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!apiResponse.ok) {
    let detail = "Background removal failed. Please try again.";

    try {
      const errorBody = (await apiResponse.json()) as { detail?: string };
      if (errorBody.detail) detail = errorBody.detail;
    } catch {
      // Keep fallback detail when FastAPI returns a non-JSON error.
    }

    return NextResponse.json({ detail }, { status: apiResponse.status });
  }

  const result = await apiResponse.arrayBuffer();

  return new Response(result, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'inline; filename="bg-removed.png"',
    },
  });
}
