/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@containerly/common'],
  output: 'standalone',
};

module.exports = nextConfig;

