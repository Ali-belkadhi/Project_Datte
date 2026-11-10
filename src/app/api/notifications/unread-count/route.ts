import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { unreadCount } from "@/server/services/NotificationService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as never, secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET" });
  if (!token?.sub) return NextResponse.json({ count: 0 }, { status: 401 });
  const c = await unreadCount(token.sub);
  return NextResponse.json({ count: c });
}