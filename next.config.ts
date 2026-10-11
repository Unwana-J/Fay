import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.2", "192.168.18.2:3000", "localhost", "localhost:3000"],
  async headers() {
    return [
      {
        source: "/vatar/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://lagoslife.app https://www.lagoslife.app https://naijalife.app https://www.naijalife.app https://lagoslife.eliysites.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
