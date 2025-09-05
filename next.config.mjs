/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "pg", "pg-hstore", "bcrypt", "jsonwebtoken"],
  },
  reactStrictMode: true,
};

export default nextConfig;

 
