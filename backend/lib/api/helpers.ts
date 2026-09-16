import { NextResponse } from "next/server";

/** Standard JSON error response. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Standard JSON success response. */
export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Parse JSON body safely; returns null on failure. */
export async function parseBody<T = Record<string, unknown>>(
  req: Request,
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}