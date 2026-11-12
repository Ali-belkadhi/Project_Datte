import { NextResponse } from "next/server";
import { lireJetonSession } from "@/lib/auth/token";
import { unreadCount } from "@/server/services/NotificationService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await lireJetonSession(req);
  if (!token?.sub) return NextResponse.json({ count: 0 }, { status: 401 });
  const c = await unreadCount(token.sub);
  return NextResponse.json({ count: c });
}