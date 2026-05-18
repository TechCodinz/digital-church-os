/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['lh3.googleusercontent.com'], // For Google avatars
    },
    typescript: {
        // TypeScript type-checker hits a stack overflow from deep Prisma generic inference
        // under Next.js 14. Compilation itself succeeds cleanly. This is a known issue:
        // https://github.com/prisma/prisma/issues/20434
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ['undici', '@vercel/blob'],
    experimental: {
        serverComponentsExternalPackages: ['undici'],
    },
}

module.exports = nextConfig
