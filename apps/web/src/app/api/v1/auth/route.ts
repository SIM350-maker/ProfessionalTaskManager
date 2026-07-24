import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import type { RateLimitConfig } from "@/lib/security/rate-limiter";

const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  const rateLimited = await checkRateLimit(request, `auth:post`, AUTH_RATE_LIMIT);
  if (rateLimited) return rateLimited;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "register") {
    const body = await request.json();
    const { registerUser } = await import("@/actions");
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => formData.append(key, value as string));
    const result = await registerUser(formData);
    if (result.success) {
      return NextResponse.json({ data: result.data }, { status: 201 });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 422 });
  }

  if (action === "login") {
    const body = await request.json();
    const { loginUser } = await import("@/actions");
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => formData.append(key, value as string));
    const result = await loginUser(formData);
    if (result.success) {
      return NextResponse.json({ data: result.data });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }

  if (action === "logout") {
    const { logoutUser } = await import("@/actions");
    await logoutUser();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: { code: "NOT_FOUND", message: "Invalid action" } },
    { status: 404 }
  );
}
