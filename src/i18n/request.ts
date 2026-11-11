import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const c = await cookies();
  const h = await headers();
  const locale = c.get("NEXT_LOCALE")?.value || h.get("accept-language")?.split(",")[0]?.split("-")[0] || "fr";
  const supported = ["fr", "ar", "en"];
  const resolved = supported.includes(locale.toLowerCase()) ? locale.toLowerCase() : "fr";
  const messages = (await import(`../../messages/${resolved}.json`)).default;
  return { locale: resolved, messages };
});