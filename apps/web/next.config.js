/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://ctoai.reiwasakura.tech/api/v1",
  }
};

module.exports = nextConfig;
