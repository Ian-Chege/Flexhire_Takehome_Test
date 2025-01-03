import relayConfig from "./relay.config.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    relay: relayConfig,
  },
  async rewrites() {
    return [
      {
        source: "/api/flexhire",
        destination: "http://localhost:3000/api/flexhire", // Rails backend
      },
    ];
  },
};

export default nextConfig;
