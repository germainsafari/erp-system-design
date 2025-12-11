import createNextIntlPlugin from "next-intl/plugin"

// Point next-intl to our request config
const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
}

export default withNextIntl(nextConfig)
