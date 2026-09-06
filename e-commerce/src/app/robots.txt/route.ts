const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.prime-electronics.ru/api";

const FALLBACK_ROBOTS = `User-agent: *
Allow: /
Disallow: /account/
Disallow: /checkout/
Disallow: /order-confirmation/
Disallow: /login
Disallow: /register
Disallow: /api/
Disallow: /*?

Sitemap: https://prime-electronics.ru/sitemap.xml`;

export const dynamic = "force-dynamic";

export async function GET() {
  let content = FALLBACK_ROBOTS;

  try {
    const response = await fetch(`${API_URL}/seo/robots`, {
      cache: "no-store",
    });
    if (response.ok) {
      const payload = (await response.json()) as { content?: string };
      if (payload.content?.trim()) content = payload.content.trim();
    }
  } catch {
    // Keep robots.txt available while the API is restarting.
  }

  return new Response(`${content}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
