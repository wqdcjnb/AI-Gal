/**
 * 本地 SQLite 用户存储（Node 22+ 内置 sqlite）
 * 替代 CloudBase NoSQL，零配置，零费用
 */
import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const dbPath = path.join(process.cwd(), '.data', 'app.db')

// 确保目录存在
import { mkdirSync } from 'node:fs'
mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new DatabaseSync(dbPath)

// 初始化表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`)

interface UserRow {
  uid: string
  email: string
  nickname: string
  avatar_url: string
  created_at: number
  updated_at: number
}

export function getUser(uid: string): UserRow | null {
  const stmt = db.prepare('SELECT * FROM users WHERE uid = ?')
  const row = stmt.get(uid) as UserRow | undefined
  return row || null
}

export function createUser(uid: string, email: string): UserRow {
  const existing = getUser(uid)
  if (existing) return existing
  const now = Date.now()
  const nickname = email.split('@')[0] || email
  db.prepare('INSERT INTO users (uid, email, nickname, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(uid, email, nickname, now, now)
  return { uid, email, nickname, avatar_url: '', created_at: now, updated_at: now }
}

export function updateUser(uid: string, data: Partial<Pick<UserRow, 'nickname' | 'avatar_url'>>) {
  const sets: string[] = []
  const vals: any[] = []
  if (data.nickname !== undefined) { sets.push('nickname = ?'); vals.push(data.nickname) }
  if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); vals.push(data.avatar_url) }
  if (sets.length === 0) return getUser(uid)
  sets.push('updated_at = ?'); vals.push(Date.now())
  vals.push(uid)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE uid = ?`).run(...vals)
  return getUser(uid)
}
