/**
 * GET /api/auth/me
 * 获取当前用户信息（从 Cookie 中的 CloudBase access_token 解析）
 * 同时查询 users 集合获取昵称等扩展信息
 */
import { parseAccessToken } from "@/lib/auth/token";
import { db, default as app } from "@/lib/cloudbase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/db-schema";

const COOKIE_NAME = "cloudbase_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    const user = parseAccessToken(token);

    if (!user) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    // 从 users 集合读取昵称和头像
    let nickname = user.email?.split("@")[0] || user.email;
    let avatarUrl = "";
    try {
      const res = await db
        .collection(COLLECTIONS.USERS)
        .where({ uid: user.uid })
        .limit(1)
        .get();
      const userDoc = res.data?.[0];
      if (userDoc?.nickname) {
        nickname = userDoc.nickname;
      }
      if (userDoc?.avatarUrl && userDoc.avatarUrl.startsWith("cloud://")) {
        // 将 fileId 解析为临时 URL
        try {
          const urlResult = await app.getTempFileURL({
            fileList: [userDoc.avatarUrl],
          });
          avatarUrl = urlResult.fileList?.[0]?.tempFileURL || "";
        } catch {
          // 解析失败，忽略
        }
      }
    } catch {
      // users 集合可能还未初始化，使用默认值
    }

    return NextResponse.json({
      loggedIn: true,
      user: { email: user.email, uid: user.uid, nickname, avatarUrl },
    });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
