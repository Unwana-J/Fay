import type { NextConfig } from "next";

const GLOBAL_SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.18.2", "192.168.18.2:3000", "localhost", "localhost:3000"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: GLOBAL_SECURITY_HEADERS,
      },
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
