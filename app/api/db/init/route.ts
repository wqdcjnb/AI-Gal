/**
 * POST /api/db/init
 * 一键初始化 AI-Gal 全部数据库集合 & 索引
 *
 * 调用方式：POST /api/db/init
 * 生产环境需加鉴权（仅管理员可调用）
 */

import { db } from "@/lib/cloudbase"
import { NextResponse } from "next/server"
import { COLLECTIONS, INDEXES, type IndexDef } from "@/lib/db-schema"

interface InitResult {
  collection: string
  status: "created" | "exists" | "error"
  message: string
}

interface IndexResult {
  collection: string
  indexName: string
  status: "created" | "exists" | "error"
  message: string
}

// ============================================================
// 确保集合存在（不存在则创建）
// ============================================================

async function ensureCollection(name: string): Promise<InitResult> {
  try {
    await db.createCollection(name)
    console.log(`[DB Init] ✅ 创建集合: ${name}`)
    return { collection: name, status: "created", message: "集合已创建" }
  } catch (error: unknown) {
    const errMsg = String(error)
    // CloudBase: 集合已存在时报错
    if (errMsg.includes("already exist") || errMsg.includes("ResourceConflict")) {
      console.log(`[DB Init] ℹ️  集合已存在: ${name}`)
      return { collection: name, status: "exists", message: "集合已存在" }
    }
    console.error(`[DB Init] ❌ 创建集合失败: ${name}`, errMsg)
    return { collection: name, status: "error", message: errMsg }
  }
}

// ============================================================
// 确保索引存在
// ============================================================

async function ensureIndex(def: IndexDef): Promise<IndexResult> {
  try {
    // CloudBase Node SDK 内部暴露了 MongoDB 兼容的 createIndex
    // 类型定义未包含，需用 any 绕过
    const col = db.collection(def.collection) as unknown as {
      createIndex: (
        keys: Record<string, 1 | -1>,
        opts: { name: string; unique: boolean }
      ) => Promise<void>
    }
    await col.createIndex(def.keys, {
      name: def.name,
      unique: def.unique ?? false,
    })
    console.log(`[DB Init] ✅ 创建索引: ${def.collection}.${def.name}`)
    return {
      collection: def.collection,
      indexName: def.name,
      status: "created",
      message: "索引已创建",
    }
  } catch (error: unknown) {
    const errMsg = String(error)
    if (errMsg.includes("already exists") || errMsg.includes("IndexOptionsConflict")) {
      console.log(`[DB Init] ℹ️  索引已存在: ${def.collection}.${def.name}`)
      return {
        collection: def.collection,
        indexName: def.name,
        status: "exists",
        message: "索引已存在",
      }
    }
    console.error(`[DB Init] ❌ 创建索引失败: ${def.collection}.${def.name}`, errMsg)
    return {
      collection: def.collection,
      indexName: def.name,
      status: "error",
      message: errMsg,
    }
  }
}

// ============================================================
// POST 处理器
// ============================================================

export async function POST() {
  const startTime = Date.now()

  // Step 1: 创建集合
  const collectionResults: InitResult[] = []
  for (const name of Object.values(COLLECTIONS)) {
    const result = await ensureCollection(name)
    collectionResults.push(result)
  }

  // Step 2: 创建索引
  const indexResults: IndexResult[] = []
  for (const def of INDEXES) {
    const result = await ensureIndex(def)
    indexResults.push(result)
  }

  const elapsed = Date.now() - startTime

  // 统计
  const collectionsCreated = collectionResults.filter((r) => r.status === "created").length
  const collectionsExisted = collectionResults.filter((r) => r.status === "exists").length
  const indexesCreated = indexResults.filter((r) => r.status === "created").length
  const indexesExisted = indexResults.filter((r) => r.status === "exists").length

  return NextResponse.json({
    success: true,
    elapsed: `${elapsed}ms`,
    summary: {
      collections: {
        total: collectionResults.length,
        created: collectionsCreated,
        existed: collectionsExisted,
      },
      indexes: {
        total: indexResults.length,
        created: indexesCreated,
        existed: indexesExisted,
      },
    },
    details: {
      collections: collectionResults,
      indexes: indexResults,
    },
  })
}
