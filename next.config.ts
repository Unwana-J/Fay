import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.2", "192.168.18.2:3000", "localhost", "localhost:3000"],
};

export default nextConfig;
