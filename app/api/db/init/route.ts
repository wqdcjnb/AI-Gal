/**
 * POST /api/db/init
 * 初始化数据库集合 & 索引
 */
import { db } from "@/lib/cloudbase";
import { NextResponse } from "next/server";
import { COLLECTIONS, INDEXES, type IndexDef } from "@/lib/db-schema";

async function ensureCollection(name: string) {
  try {
    await db.createCollection(name);
    return { collection: name, status: "created" };
  } catch (e: any) {
    if (String(e).includes("already exist")) return { collection: name, status: "exists" };
    return { collection: name, status: "error", message: String(e) };
  }
}

async function ensureIndex(def: IndexDef) {
  try {
    const col = db.collection(def.collection) as any;
    await col.createIndex(def.keys, { name: def.name, unique: def.unique ?? false });
    return { collection: def.collection, index: def.name, status: "created" };
  } catch (e: any) {
    if (String(e).includes("already exist")) return { collection: def.collection, index: def.name, status: "exists" };
    return { collection: def.collection, index: def.name, status: "error", message: String(e) };
  }
}

export async function POST() {
  const results = { collections: [] as any[], indexes: [] as any[] };

  for (const name of Object.values(COLLECTIONS)) {
    results.collections.push(await ensureCollection(name));
  }
  for (const def of INDEXES) {
    results.indexes.push(await ensureIndex(def));
  }

  return NextResponse.json({ success: true, ...results });
}
