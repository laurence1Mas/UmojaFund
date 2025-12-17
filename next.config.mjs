/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // i18n removed because App Router handles internationalization differently.
  // If you need i18n with App Router, use a supported approach (e.g., `next-intl` or per-route handling).
  // i18n: {
  //   locales: ['fr', 'en', 'sw'], // Langues supportées
  //   defaultLocale: 'fr', // Langue par défaut
  //   localeDetection: true, // Détection automatique
  // },

  webpack: (config, { isServer }) => {
    // enable WebAssembly support for wasm packages (e.g., siden-csl-rs-browser)
    config.experiments = { ...(config.experiments || {}), asyncWebAssembly: true };

    // Ensure .wasm files are treated as async WebAssembly modules
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig
