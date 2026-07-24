import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/session";
import { getRoleFromString } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const rawUser = await validateSession(token);

  if (!rawUser) {
    const response = NextResponse.json({ user: null });
    response.cookies.delete("session_token");
    return response;
  }

  const user = { ...rawUser, role: getRoleFromString(rawUser.role) };

  return NextResponse.json({ user });
}
