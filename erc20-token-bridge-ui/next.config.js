require("dotenv").config();
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["icons.iconarchive.com", "cdn.iconscout.com"],
  },
  env: {
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
