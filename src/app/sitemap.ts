import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.comalrivercasa.com',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://www.comalrivercasa.com/policies/terms',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://www.comalrivercasa.com/policies/cancellation',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://www.comalrivercasa.com/policies/house-rules',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
