/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "pg", "pg-hstore"],
  },
  reactStrictMode: true,
};

export default nextConfig;

 
