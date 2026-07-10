'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Edit2, Image, Sparkles, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// Types
interface Sprite {
  id: string;
  characterId: string;
  name: string;
  type: 'base' | 'expression' | 'outfit' | 'pose';
  url: string;
  tags: string[];
}

interface Character {
  id: string;
  name: string;
  personality: string;
  description: string;
  color: string;
  avatar?: string;
  sprites: Sprite[];
}

// Mock data
const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: '桜',
    personality: '温柔 / 内向 / 专一',
    description: '温柔的青梅竹马，总是默默守护着主人公。喜欢文学，经常在社团教室看书。',
    color: '#ec4899',
    sprites: [
      { id: 's1-1', characterId: 'char-1', name: '通常', type: 'base', url: '', tags: ['默认'] },
      { id: 's1-2', characterId: 'char-1', name: '微笑', type: 'expression', url: '', tags: ['开心', '温柔'] },
      { id: 's1-3', characterId: 'char-1', name: '惊讶', type: 'expression', url: '', tags: ['意外'] },
      { id: 's1-4', characterId: 'char-1', name: '哭泣', type: 'expression', url: '', tags: ['悲伤'] },
      { id: 's1-5', characterId: 'char-1', name: '愤怒', type: 'expression', url: '', tags: ['生气'] },
      { id: 's1-6', characterId: 'char-1', name: '害羞', type: 'expression', url: '', tags: ['脸红'] },
      { id: 's1-7', characterId: 'char-1', name: '制服', type: 'outfit', url: '', tags: ['学校'] },
      { id: 's1-8', characterId: 'char-1', name: '便服', type: 'outfit', url: '', tags: ['日常'] },
      { id: 's1-9', characterId: 'char-1', name: '抬手', type: 'pose', url: '', tags: ['动作'] },
    ],
  },
  {
    id: 'char-2',
    name: '主人公',
    personality: '普通 / 善良',
    description: '普通的高中生，性格温和，喜欢安静的生活。',
    color: '#3b82f6',
    sprites: [
      { id: 's2-1', characterId: 'char-2', name: '通常', type: 'base', url: '', tags: ['默认'] },
      { id: 's2-2', characterId: 'char-2', name: '微笑', type: 'expression', url: '', tags: ['开心'] },
      { id: 's2-3', characterId: 'char-2', name: '困惑', type: 'expression', url: '', tags: ['思考'] },
    ],
  },
];

function CharacterGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get('id');

  const [character, setCharacter] = useState<Character | null>(null);
  const [selectedSprite, setSelectedSprite] = useState<Sprite | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSpriteName, setNewSpriteName] = useState('');
  const [newSpriteType, setNewSpriteType] = useState<'expression' | 'outfit' | 'pose'>('expression');
  const [newSpriteTags, setNewSpriteTags] = useState('');

  useEffect(() => {
    if (characterId) {
      const found = mockCharacters.find(c => c.id === characterId);
      if (found) {
        setCharacter(found);
        const baseSprite = found.sprites.find(s => s.type === 'base');
        if (baseSprite) setSelectedSprite(baseSprite);
      }
    }
  }, [characterId]);

  const handleAddSprite = () => {
    if (!character || !newSpriteName) return;
    const newSprite: Sprite = {
      id: `sprite-${Date.now()}`,
      characterId: character.id,
      name: newSpriteName,
      type: newSpriteType,
      url: '',
      tags: newSpriteTags.split(',').map(t => t.trim()).filter(Boolean),
    };
    setCharacter({ ...character, sprites: [...character.sprites, newSprite] });
    setNewSpriteName('');
    setNewSpriteTags('');
    setShowAddDialog(false);
  };

  const handleDeleteSprite = (spriteId: string) => {
    if (!character) return;
    const newSprites = character.sprites.filter(s => s.id !== spriteId);
    setCharacter({ ...character, sprites: newSprites });
    if (selectedSprite?.id === spriteId) {
      const baseSprite = newSprites.find(s => s.type === 'base');
      setSelectedSprite(baseSprite || null);
    }
  };

  const expressionSprites = character?.sprites.filter(s => s.type === 'expression') || [];
  const outfitSprites = character?.sprites.filter(s => s.type === 'outfit') || [];
  const poseSprites = character?.sprites.filter(s => s.type === 'pose') || [];
  const baseSprite = character?.sprites.find(s => s.type === 'base');

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">角色未找到</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-pink-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-stone-800">角色画廊</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-pink-200 hover:bg-pink-50"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加立绘
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Character Info + Base Sprite */}
        <div className="flex gap-8 mb-12">
          {/* Base Sprite */}
          <Card
            className="w-80 h-96 flex-shrink-0 overflow-hidden border-pink-100 shadow-lg shadow-pink-100/40 cursor-pointer group"
            onClick={() => baseSprite && setSelectedSprite(baseSprite)}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-50 to-violet-50 flex flex-col items-center justify-center relative">
              {baseSprite?.url ? (
                <img src={baseSprite.url} alt={baseSprite.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.name[0]}
                  </div>
                  <span className="text-sm text-stone-500">基础立绘</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Card>

          {/* Character Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-3xl font-bold text-stone-800">{character.name}</h2>
              <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                {character.sprites.length} 张立绘
              </Badge>
            </div>
            <p className="text-stone-600 mb-4 italic">&ldquo;{character.description}&rdquo;</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500 w-16">性格:</span>
                <div className="flex gap-2">
                  {character.personality.split(' / ').map((trait, i) => (
                    <Badge key={i} variant="outline" className="border-pink-200 text-pink-600">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500 w-16">颜色:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: character.color }}
                  />
                  <span className="text-sm text-stone-600 font-mono">{character.color}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Card className="p-4 border-pink-100 bg-pink-50/50">
                <div className="text-2xl font-bold text-pink-600">{expressionSprites.length}</div>
                <div className="text-sm text-stone-500">表情差分</div>
              </Card>
              <Card className="p-4 border-violet-100 bg-violet-50/50">
                <div className="text-2xl font-bold text-violet-600">{outfitSprites.length}</div>
                <div className="text-sm text-stone-500">服装差分</div>
              </Card>
              <Card className="p-4 border-amber-100 bg-amber-50/50">
                <div className="text-2xl font-bold text-amber-600">{poseSprites.length}</div>
                <div className="text-sm text-stone-500">动作差分</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Selected Sprite Preview */}
        {selectedSprite && (
          <Card className="mb-8 p-6 border-pink-100 bg-gradient-to-r from-pink-50/50 to-violet-50/50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-white border border-pink-100 flex items-center justify-center">
                {selectedSprite.url ? (
                  <img src={selectedSprite.url} alt={selectedSprite.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Image className="w-8 h-8 text-pink-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-stone-800">{selectedSprite.name}</h3>
                  <Badge className={
                    selectedSprite.type === 'base' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                    selectedSprite.type === 'expression' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                    selectedSprite.type === 'outfit' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }>
                    {selectedSprite.type === 'base' ? '基础' :
                     selectedSprite.type === 'expression' ? '表情' :
                     selectedSprite.type === 'outfit' ? '服装' : '动作'}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-1">
                  {selectedSprite.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-stone-200 text-stone-500">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Expression Sprites */}
        <SpriteSection
          title="表情差分"
          icon="😊"
          sprites={expressionSprites}
          selectedSprite={selectedSprite}
          onSelect={setSelectedSprite}
          onDelete={handleDeleteSprite}
          color="violet"
        />

        {/* Outfit Sprites */}
        <SpriteSection
          title="服装差分"
          icon="👗"
          sprites={outfitSprites}
          selectedSprite={selectedSprite}
          onSelect={setSelectedSprite}
          onDelete={handleDeleteSprite}
          color="amber"
        />

        {/* Pose Sprites */}
        <SpriteSection
          title="动作差分"
          icon="🎭"
          sprites={poseSprites}
          selectedSprite={selectedSprite}
          onSelect={setSelectedSprite}
          onDelete={handleDeleteSprite}
          color="emerald"
        />
      </div>

      {/* Add Sprite Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white border-pink-100">
          <DialogHeader>
            <DialogTitle className="text-stone-800">添加立绘</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">名称</label>
              <Input
                value={newSpriteName}
                onChange={(e) => setNewSpriteName(e.target.value)}
                placeholder="例如: 微笑、制服、抬手"
                className="border-pink-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">类型</label>
              <div className="flex gap-2">
                <Button
                  variant={newSpriteType === 'expression' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewSpriteType('expression')}
                  className={newSpriteType === 'expression' ? 'bg-violet-500 hover:bg-violet-600' : 'border-violet-200'}
                >
                  表情
                </Button>
                <Button
                  variant={newSpriteType === 'outfit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewSpriteType('outfit')}
                  className={newSpriteType === 'outfit' ? 'bg-amber-500 hover:bg-amber-600' : 'border-amber-200'}
                >
                  服装
                </Button>
                <Button
                  variant={newSpriteType === 'pose' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewSpriteType('pose')}
                  className={newSpriteType === 'pose' ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-emerald-200'}
                >
                  动作
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">标签（逗号分隔）</label>
              <Input
                value={newSpriteTags}
                onChange={(e) => setNewSpriteTags(e.target.value)}
                placeholder="例如: 开心, 温柔"
                className="border-pink-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddSprite}
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sprite Section Component
function SpriteSection({
  title,
  icon,
  sprites,
  selectedSprite,
  onSelect,
  onDelete,
  color,
}: {
  title: string;
  icon: string;
  sprites: Sprite[];
  selectedSprite: Sprite | null;
  onSelect: (sprite: Sprite) => void;
  onDelete: (id: string) => void;
  color: string;
}) {
  if (sprites.length === 0) return null;

  const colorClasses = {
    violet: 'border-violet-100 hover:border-violet-300',
    amber: 'border-amber-100 hover:border-amber-300',
    emerald: 'border-emerald-100 hover:border-emerald-300',
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
        <Badge variant="outline" className="border-stone-200 text-stone-500">
          {sprites.length}
        </Badge>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sprites.map((sprite) => (
          <Card
            key={sprite.id}
            className={`w-32 h-40 flex-shrink-0 overflow-hidden cursor-pointer group relative transition-all ${
              selectedSprite?.id === sprite.id
                ? 'ring-2 ring-pink-400 border-pink-300'
                : colorClasses[color as keyof typeof colorClasses]
            }`}
            onClick={() => onSelect(sprite)}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-50 to-violet-50 flex flex-col items-center justify-center">
              {sprite.url ? (
                <img src={sprite.url} alt={sprite.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Image className="w-8 h-8 text-pink-300" />
                  <span className="text-xs text-stone-500 text-center px-2">{sprite.name}</span>
                </div>
              )}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  // Edit action
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sprite.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {/* Name label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <span className="text-xs text-white font-medium">{sprite.name}</span>
            </div>
          </Card>
        ))}
        {/* Add button */}
        <Card className="w-32 h-40 flex-shrink-0 border-dashed border-2 border-pink-200 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-pink-400">
            <Plus className="w-8 h-8" />
            <span className="text-xs">添加</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CharacterGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">加载中...</div>}>
      <CharacterGalleryContent />
    </Suspense>
  );
}
