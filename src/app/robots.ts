import type { MetadataRoute } from "next";

/** The atelier, private receipts, and personal pages stay out of the index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/order/", "/account", "/account/", "/saved", "/checkout"],
    },
    sitemap: process.env.SITE_URL ? `${process.env.SITE_URL}/sitemap.xml` : undefined,
  };
}
