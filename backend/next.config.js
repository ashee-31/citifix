/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGIN || "http://localhost:3000" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    }];
  },
};

module.exports = nextConfig;
