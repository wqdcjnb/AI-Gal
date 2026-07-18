/**
 * CloudBase 服务端 SDK 初始化
 * 仅在服务端使用（API Routes / Server Components / Server Actions）
 */
import cloudbase from "@cloudbase/node-sdk";

if (!process.env.CLOUDBASE_ENV_ID) {
  throw new Error("缺少环境变量 CLOUDBASE_ENV_ID");
}

const app = cloudbase.init({
  env: process.env.CLOUDBASE_ENV_ID,
  credentials: process.env.CLOUDBASE_API_KEY
    ? { private_key: process.env.CLOUDBASE_API_KEY }
    : { secretId: process.env.TENCENTCLOUD_SECRETID, secretKey: process.env.TENCENTCLOUD_SECRETKEY },
} as any);

// NoSQL 文档数据库（旧，仅 auth/register 残留使用）
export const db = app.database();

// PostgreSQL 关系型数据库（项目数据存储）
// rdb() 参数说明：不传 database 时会把 envId 作为 schema 名，会报 PGRST106
export const rdb = (app as any).rdb({ database: "public" });

// 导出 CloudBase 应用实例
export default app;
