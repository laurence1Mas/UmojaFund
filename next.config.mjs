/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  i18n: {
    locales: ['fr', 'en', 'sw'], // Langues supportées
    defaultLocale: 'fr', // Langue par défaut
    localeDetection: true, // Détection automatique
  },
}

export default nextConfig
