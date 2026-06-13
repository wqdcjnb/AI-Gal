"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Sparkles,
  Heart,
  Eye,
  Play,
  UserRound,
  FolderOpen,
} from "lucide-react"
import type { GameCategory, PublicWork } from "@/types/project"

const mockWorks: PublicWork[] = [
  {
    id: "pub-1",
    projectName: "夏日幻梦",
    authorName: "创作者小明",
    coverUrl: "",
    category: "校园",
    description: "一个发生在夏日校园的青春恋爱故事，多条分支，多个结局。",
    likes: 1280,
    publishedAt: "2026-05-20",
  },
  {
    id: "pub-2",
    projectName: "异世界冒险录",
    authorName: "幻想者",
    coverUrl: "",
    category: "异世界",
    description: "被召唤到异世界的高中生展开的冒险传奇。",
    likes: 956,
    publishedAt: "2026-06-01",
  },
  {
    id: "pub-3",
    projectName: "深夜迷案",
    authorName: "推理爱好者",
    coverUrl: "",
    category: "悬疑",
    description: "都市深夜的连环案件，你能揭开真相吗？",
    likes: 723,
    publishedAt: "2026-04-15",
  },
  {
    id: "pub-4",
    projectName: "江南烟雨录",
    authorName: "古风写手",
    coverUrl: "",
    category: "古风",
    description: "大楚王朝下的才子佳人故事，一曲琵琶诉不尽天下兴亡。",
    likes: 1456,
    publishedAt: "2026-03-10",
  },
  {
    id: "pub-5",
    projectName: "星辰之约",
    authorName: "星空旅人",
    coverUrl: "",
    category: "恋爱",
    description: "在樱花盛开的季节，命运将两人紧紧相连。",
    likes: 892,
    publishedAt: "2026-06-05",
  },
  {
    id: "pub-6",
    projectName: "日常咖啡屋",
    authorName: "咖啡与猫",
    coverUrl: "",
    category: "日常",
    description: "在小城咖啡店里发生的温暖日常，治愈系 Galgame。",
    likes: 567,
    publishedAt: "2026-05-28",
  },
]

const categories: GameCategory[] = ["校园", "奇幻", "悬疑", "异世界", "日常", "科幻", "恋爱", "古风"]

export default function GalleryPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<GameCategory | "全部">("全部")

  const filtered = mockWorks.filter((w) => {
    const matchSearch =
      !search ||
      w.projectName.toLowerCase().includes(search.toLowerCase()) ||
      w.authorName.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === "全部" || w.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="max-w-(--breakpoint-xl) mx-auto py-12 px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3 w-3 text-purple-500" />
              作品广场
            </div>
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-semibold tracking-tight mb-3">
              发现精彩
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}Galgame
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              浏览社区创作者公开分享的作品，在线试玩，一键引用素材到你的项目
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索作品名称、作者..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={activeCategory === "全部" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveCategory("全部")}
              >
                全部
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Works Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((work) => (
              <Card key={work.id} className="overflow-hidden group hover:shadow-lg transition-all">
                {/* Cover */}
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 relative flex items-center justify-center">
                  <FolderOpen className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl"
                    >
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                  </div>
                  {/* Category badge */}
                  <Badge className="absolute top-3 left-3 text-[10px] bg-background/80 backdrop-blur-sm border-none">
                    {work.category}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{work.projectName}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {work.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserRound className="h-3 w-3" />
                      {work.authorName}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {work.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        预览
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">没有找到匹配的作品</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
