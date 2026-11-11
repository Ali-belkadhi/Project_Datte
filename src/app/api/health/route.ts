import { siteConfig } from "@/config/site";
import { connectMongoose } from "@/server/db/mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connection = await connectMongoose();
    const database = connection.connection.db;
    if (!database) throw new Error("MongoDB connection has no active database");
    await database.admin().ping();

    return Response.json(
      { ok: true, app: siteConfig.name, version: siteConfig.version, database: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { ok: false, app: siteConfig.name, version: siteConfig.version, database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
