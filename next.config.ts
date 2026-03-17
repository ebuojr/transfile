import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // simple-peer uses Node.js built-ins (events, buffer, crypto) — exclude from server bundles.
  // It's dynamically imported in useEffect (browser only), so this is just belt-and-suspenders.
  serverExternalPackages: ['simple-peer'],
}

export default nextConfig
