/**
 * AI-Gal 数据库 Schema（精简版）
 *
 * CloudBase NoSQL 文档数据库（MongoDB 兼容）
 *
 * 当前仅保留 users 表，其余集合待重构
 */

// ============================================================
// users
// ============================================================

export interface UserDoc {
  _id: string
  uid: string       // CloudBase Auth uid
  email: string
  username: string  // CloudBase Auth 登录用户名
  nickname: string  // 显示名称
  avatarUrl: string // CloudBase 存储 fileId
  createdAt: number
  updatedAt: number
}

// ============================================================
// 集合名常量
// ============================================================

export const COLLECTIONS = {
  USERS: "users",
} as const

// ============================================================
// 索引定义
// ============================================================

export interface IndexDef {
  collection: string
  name: string
  keys: Record<string, 1 | -1>
  unique?: boolean
}

export const INDEXES: IndexDef[] = [
  {
    collection: COLLECTIONS.USERS,
    name: "idx_uid",
    keys: { uid: 1 },
    unique: true,
  },
  {
    collection: COLLECTIONS.USERS,
    name: "idx_email",
    keys: { email: 1 },
  },
]
