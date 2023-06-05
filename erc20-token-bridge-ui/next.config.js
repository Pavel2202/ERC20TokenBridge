require("dotenv").config();
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
