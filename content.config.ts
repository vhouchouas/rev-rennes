import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    news: defineCollection({
      source: 'news/*.md',
      type: 'page',
      schema: z.object({
        date: z.string(),
        newsBannerText: z.string(),
      })
    })
  }
})