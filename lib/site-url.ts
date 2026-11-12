const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL

export const siteUrl = host ? `https://${host}` : 'http://localhost:3000'
