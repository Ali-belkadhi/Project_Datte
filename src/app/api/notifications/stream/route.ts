import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { notificationBus } from "@/server/services/NotificationBus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? "dev-only-secret-please-set-AUTH_SECRET" });
  if (!token?.sub) return new Response("Unauthorized", { status: 401 });
  const userId = token.sub;
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
      const unsub = notificationBus.subscribe(userId, (payload) => send(payload));
      const heartbeat = setInterval(() => {
        try { controller.enqueue(enc.encode(`: heartbeat\n\n`)); } catch {}
      }, 25000);
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsub();
        try { controller.close(); } catch {}
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}