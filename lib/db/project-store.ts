/**
 * CloudBase PostgreSQL 项目数据存储
 *
 * 使用 app.rdb() 访问 CloudBase 关系型数据库（Supabase 风格 API）
 * 建表 SQL 见 scripts/migrate-pg.sql — 需在 CloudBase DMC 控制台执行
 *
 * 所有函数均为 async，返回 { data, error } 结构
 */
import { rdb } from "../cloudbase/cloudbase"

// ============================================================
// 类型定义
// ============================================================

export interface ProjectRow {
  id: string
  user_id: string
  name: string
  emotion_style: string
  theme_background: string
  narrative_structure: string
  synopsis: string
  chapter_count: number
  cover_url: string | null
  status: string
  created_at: number
  updated_at: number
}

export interface ChapterRow {
  id: string
  project_id: string
  number: number
  title: string
  summary: string
  scenes: string[]                 // JSONB → 自动序列化
  route: string
  ending_type: string | null
  branch_from: string | null
  sort_order: number
  created_at: number
  updated_at: number
}

export interface KeyPointRow {
  id: string
  chapter_id: string
  text: string
  description: string | null
  sort_order: number
}

export interface EndingRow {
  id: string
  project_id: string
  type: string
  name: string
  description: string
}

export interface SubSectionRow {
  id: string
  chapter_id: string
  title: string
  background: string
  bgm: string
  cg_trigger: string | null
  transition: string
  is_branch: number
  branch_from: string | null
  dialogues: any[]                // JSONB → 自动序列化
  triggers: any[]                 // JSONB → 自动序列化
  sort_order: number
}

export interface CharacterRow {
  id: string
  project_id: string
  name: string
  color: string
  avatar: string | null
  personality: string | null
  description: string | null
  appearance: string[]            // JSONB
  temperament: string[]           // JSONB
  extra_description: string | null
  sort_order: number
  created_at: number
  updated_at: number
}

export interface SpriteRow {
  id: string
  character_id: string
  name: string
  type: string
  frame_type: string | null
  url: string
  tags: string[]                  // JSONB
  sort_order: number
}

export interface SpriteComboRow {
  id: string
  character_id: string
  sprite_id: string
  expression_id: string | null
  outfit_id: string | null
  pose_id: string | null
  name: string
  url: string | null
}

export interface AssetRow {
  id: string
  project_id: string
  name: string
  category: string
  url: string
  file_id: string | null
  tags: string[]                  // JSONB
  status: string
  has_diff: number
  diff_count: number
  plot_node: string | null
  plot_description: string | null
  created_at: number
}

// ============================================================
// Projects
// ============================================================

export async function listProjects(userId: string) {
  return rdb.from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
}

export async function getProject(projectId: string) {
  const { data, error } = await rdb.from("projects")
    .select("*")
    .eq("id", projectId)
  return { data: data?.[0] ?? null, error }
}

export async function createProject(row: ProjectRow) {
  return rdb.from("projects").insert(row)
}

export async function updateProject(id: string, fields: Partial<ProjectRow>) {
  return rdb.from("projects")
    .update({ ...fields, updated_at: Date.now() })
    .eq("id", id)
}

export async function deleteProject(id: string) {
  // CASCADE 自动清理 chapters, characters, assets 等
  return rdb.from("projects").delete().eq("id", id)
}

// ============================================================
// Chapters
// ============================================================

export async function listChapters(projectId: string) {
  return rdb.from("chapters")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
}

export async function getChapter(chapterId: string) {
  const { data, error } = await rdb.from("chapters")
    .select("*")
    .eq("id", chapterId)
  return { data: data?.[0] ?? null, error }
}

export async function createChapter(row: ChapterRow) {
  return rdb.from("chapters").insert(row)
}

export async function updateChapter(id: string, fields: Partial<ChapterRow>) {
  return rdb.from("chapters")
    .update({ ...fields, updated_at: Date.now() })
    .eq("id", id)
}

export async function deleteChapter(id: string) {
  return rdb.from("chapters").delete().eq("id", id)
}

export async function saveChapters(projectId: string, chapters: ChapterRow[]) {
  // 先删后插（简化事务处理）
  await rdb.from("chapters").delete().eq("project_id", projectId)
  if (chapters.length > 0) {
    return rdb.from("chapters").insert(chapters)
  }
  return { data: [], error: null }
}

// ============================================================
// Key Points
// ============================================================

export async function listKeyPoints(chapterId: string) {
  return rdb.from("key_points")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("sort_order")
}

export async function saveKeyPoints(chapterId: string, keyPoints: KeyPointRow[]) {
  await rdb.from("key_points").delete().eq("chapter_id", chapterId)
  if (keyPoints.length > 0) {
    return rdb.from("key_points").insert(keyPoints)
  }
  return { data: [], error: null }
}

// ============================================================
// Endings
// ============================================================

export async function listEndings(projectId: string) {
  return rdb.from("endings")
    .select("*")
    .eq("project_id", projectId)
}

export async function saveEndings(projectId: string, endings: EndingRow[]) {
  await rdb.from("endings").delete().eq("project_id", projectId)
  if (endings.length > 0) {
    return rdb.from("endings").insert(endings)
  }
  return { data: [], error: null }
}

// ============================================================
// Sub Sections
// ============================================================

export async function listSubSections(chapterId: string) {
  return rdb.from("sub_sections")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("sort_order")
}

export async function getSubSection(id: string) {
  const { data, error } = await rdb.from("sub_sections")
    .select("*")
    .eq("id", id)
  return { data: data?.[0] ?? null, error }
}

export async function saveSubSections(chapterId: string, sections: SubSectionRow[]) {
  // 先删后插，调用方（PATCH /full）保证传入该章节全部小节
  await rdb.from("sub_sections").delete().eq("chapter_id", chapterId)
  if (sections.length > 0) {
    return rdb.from("sub_sections").insert(sections)
  }
  return { data: [], error: null }
}

/** 安全 upsert 单个小节（不会删除同章节其他小节），供 /api/subsections 使用 */
export async function upsertSubSection(section: SubSectionRow) {
  const { data: existing } = await rdb.from("sub_sections").select("id").eq("id", section.id)
  if (existing && existing.length > 0) {
    return rdb.from("sub_sections").update(section).eq("id", section.id)
  }
  return rdb.from("sub_sections").insert(section)
}

export async function updateSubSection(id: string, fields: Partial<SubSectionRow>) {
  return rdb.from("sub_sections").update(fields).eq("id", id)
}

// ============================================================
// Characters
// ============================================================

export async function listCharacters(projectId: string) {
  return rdb.from("characters")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
}

export async function getCharacter(id: string) {
  const { data, error } = await rdb.from("characters")
    .select("*")
    .eq("id", id)
  return { data: data?.[0] ?? null, error }
}

export async function createCharacter(row: CharacterRow) {
  return rdb.from("characters").insert(row)
}

export async function updateCharacter(id: string, fields: Partial<CharacterRow>) {
  return rdb.from("characters")
    .update({ ...fields, updated_at: Date.now() })
    .eq("id", id)
}

export async function deleteCharacter(id: string) {
  return rdb.from("characters").delete().eq("id", id)
}

export async function saveCharacters(projectId: string, characters: CharacterRow[]) {
  await rdb.from("characters").delete().eq("project_id", projectId)
  if (characters.length > 0) {
    return rdb.from("characters").insert(characters)
  }
  return { data: [], error: null }
}

// ============================================================
// Sprites
// ============================================================

export async function listSprites(characterId: string) {
  return rdb.from("sprites")
    .select("*")
    .eq("character_id", characterId)
    .order("sort_order")
}

export async function saveSprites(characterId: string, sprites: SpriteRow[]) {
  await rdb.from("sprites").delete().eq("character_id", characterId)
  if (sprites.length > 0) {
    return rdb.from("sprites").insert(sprites)
  }
  return { data: [], error: null }
}

// ============================================================
// Sprite Combos
// ============================================================

export async function listSpriteCombos(characterId: string) {
  return rdb.from("sprite_combos")
    .select("*")
    .eq("character_id", characterId)
}

export async function saveSpriteCombos(characterId: string, combos: SpriteComboRow[]) {
  await rdb.from("sprite_combos").delete().eq("character_id", characterId)
  if (combos.length > 0) {
    return rdb.from("sprite_combos").insert(combos)
  }
  return { data: [], error: null }
}

// ============================================================
// Assets
// ============================================================

export async function listAssets(projectId: string, category?: string) {
  let query = rdb.from("assets").select("*").eq("project_id", projectId)
  if (category) {
    query = query.eq("category", category)
  }
  return query.order("created_at", { ascending: false })
}

export async function getAsset(id: string) {
  const { data, error } = await rdb.from("assets")
    .select("*")
    .eq("id", id)
  return { data: data?.[0] ?? null, error }
}

export async function createAsset(row: AssetRow) {
  return rdb.from("assets").insert(row)
}

export async function updateAsset(id: string, fields: Partial<AssetRow>) {
  return rdb.from("assets").update(fields).eq("id", id)
}

export async function deleteAsset(id: string) {
  return rdb.from("assets").delete().eq("id", id)
}

// ============================================================
// 便捷操作：整个项目一次性加载
// ============================================================

export interface FullProject {
  project: ProjectRow
  chapters: ChapterRow[]
  endings: EndingRow[]
  characters: (CharacterRow & { sprites: SpriteRow[]; combos: SpriteComboRow[] })[]
  assets: AssetRow[]
}

/** 一次性加载项目所有数据（并行查询） */
export async function loadFullProject(projectId: string): Promise<{ data: FullProject | null; error: any }> {
  try {
    const [projRes, chRes, endRes, charRes, assetRes] = await Promise.all([
      getProject(projectId),
      listChapters(projectId),
      listEndings(projectId),
      listCharacters(projectId),
      listAssets(projectId),
    ])

    if (projRes.error || !projRes.data) {
      return { data: null, error: projRes.error || "项目不存在" }
    }

    // 并行加载每个角色的 sprites 和 combos
    const charactersWithDetails = await Promise.all(
      (charRes.data || []).map(async (char: CharacterRow) => {
        const [sprRes, cmbRes] = await Promise.all([
          listSprites(char.id),
          listSpriteCombos(char.id),
        ])
        return { ...char, sprites: sprRes.data || [], combos: cmbRes.data || [] }
      })
    )

    return {
      data: {
        project: projRes.data,
        chapters: chRes.data || [],
        endings: endRes.data || [],
        characters: charactersWithDetails,
        assets: assetRes.data || [],
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error }
  }
}

/** 统计项目数量 */
export async function countUserProjects(userId: string): Promise<number> {
  const { data, error } = await rdb.from("projects")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
  return data?.length ?? 0
}
