import { NextResponse } from "next/server";
import { isOAuthProviderConfigured, OAUTH_PROVIDERS } from "@/lib/oauth";

export async function GET() {
  const providers = OAUTH_PROVIDERS.filter(isOAuthProviderConfigured);
  return NextResponse.json({ providers });
}
