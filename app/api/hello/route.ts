/**
 * CloudBase 示例 API - Health Check
 * GET /api/hello
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from CloudBase + Next.js!",
    envId: process.env.CLOUDBASE_ENV_ID,
    timestamp: Date.now(),
  });
}
