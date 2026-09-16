import { NextResponse } from "next/server";
import { isDemoMode, hasSupabase, hasAi, hasBlockchain } from "@/lib/demo/mode";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "citifix",
    time: new Date().toISOString(),
    mode: isDemoMode() ? "demo" : "live",
    integrations: {
      supabase: hasSupabase(),
      ai: hasAi(),
      blockchain: hasBlockchain(),
    },
  });
}