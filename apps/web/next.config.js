/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/sign-up', destination: '/sign-in', permanent: true },
    ];
  },
};

export default nextConfig;
