let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // Ignore error if the config file doesn't exist or can't be imported
  console.log('No user config found, proceeding with default config.')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

/**
 * Merges the user config into the default nextConfig
 * @param {object} nextConfig - The default configuration
 * @param {object} userConfig - The user-specific configuration
 * @returns {object} The merged configuration
 */
function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return nextConfig
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      nextConfig[key] !== null &&
      userConfig[key] !== null
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
  return nextConfig
}

// Merge user config with default config
export default mergeConfig(nextConfig, userConfig)
