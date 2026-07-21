/**
 * 用户扩展信息存储（CloudBase PostgreSQL）
 *
 * 表: public.profiles
 * 关联: profiles.uid → auth.users.uid（CloudBase 内置认证）
 *
 * 所有函数均为 async
 */
import { rdb } from "../cloudbase/cloudbase"

// ============================================================
// 类型
// ============================================================

export interface UserRow {
  uid: string
  email: string
  nickname: string
  avatar_url: string
  created_at: number
  updated_at: number
}

// ============================================================
// CRUD
// ============================================================

/** 获取用户扩展信息 */
export async function getUser(uid: string): Promise<UserRow | null> {
  const { data, error } = await rdb
    .from("profiles")
    .select("*")
    .eq("uid", uid)

  if (error || !data?.length) return null
  return data[0] as UserRow
}

/** 创建用户扩展信息（注册时调用） */
export async function createUser(uid: string, email: string): Promise<UserRow> {
  // 先查是否存在（upsert 也能处理，但保留兼容性）
  const existing = await getUser(uid)
  if (existing) return existing

  const now = Date.now()
  const nickname = email.split("@")[0] || email

  const { error } = await rdb.from("profiles").insert({
    uid,
    email,
    nickname,
    avatar_url: "",
    created_at: now,
    updated_at: now,
  })

  if (error) throw new Error(`创建用户失败: ${error.message || error}`)

  return { uid, email, nickname, avatar_url: "", created_at: now, updated_at: now }
}

/** 更新用户扩展信息（昵称、头像） */
export async function updateUser(
  uid: string,
  data: Partial<Pick<UserRow, "nickname" | "avatar_url">>
): Promise<UserRow | null> {
  const fields: Record<string, any> = { updated_at: Date.now() }
  if (data.nickname !== undefined) fields.nickname = data.nickname
  if (data.avatar_url !== undefined) fields.avatar_url = data.avatar_url

  const { error } = await rdb.from("profiles").update(fields).eq("uid", uid)

  if (error) throw new Error(`更新用户失败: ${error.message || error}`)

  return getUser(uid)
}
