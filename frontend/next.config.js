/** @type {import('next').NextConfig} */
const basePath = '/UrbanNext';
const nextConfig = {
  basePath,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    return [
      { source: '/', destination: basePath, basePath: false, permanent: false },
    ];
  },
};
module.exports = nextConfig;
