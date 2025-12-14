import { getRequestConfig } from "next-intl/server"
import { defaultLocale, locales } from "./config"

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise in Next.js 15+, so await it
  const locale = (await requestLocale) || defaultLocale

  const resolvedLocale = locales.includes(locale as any) ? locale : defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  }
})




