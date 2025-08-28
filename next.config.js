const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sjc.microlink.io",
      },
    ],
  },
};

module.exports = nextConfig;
