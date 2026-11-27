import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/studio', '/blog/'].map((path) => ({ url: `https://suitme.pierref.eu${path}` }));
}
