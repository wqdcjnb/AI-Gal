import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许局域网访问（消除 cross-origin 警告）
  allowedDevOrigins: ["192.168.0.100", "localhost"],
};

export default nextConfig;
