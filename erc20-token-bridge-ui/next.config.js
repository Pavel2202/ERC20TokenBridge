require("dotenv").config();
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["icons.iconarchive.com", "cdn.iconscout.com"],
  },
  env: {
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    MUMBAI_RPC_URL: process.env.MUMBAI_RPC_URL,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
