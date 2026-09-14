import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Heart,
  Plus,
  Compass,
  Info,
  Layers,
  Sparkles,
  Move,
} from 'lucide-react';
import { Member, TreeNode } from '../types.ts';

interface FamilyTreeProps {
  treeRoots: TreeNode[];
  members: Member[];
  onSelectMember: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  canEdit: boolean;
  highlightId?: string | null;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({
  treeRoots,
  members,
  onSelectMember,
  onAddChild,
  canEdit,
  highlightId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Group members by generation for quick generation level indicators
  const generations = useMemo(() => {
    const map: Record<number, Member[]> = {};
    members.forEach((m) => {
      const g = m.generation || 1;
      if (!map[g]) map[g] = [];
      map[g].push(m);
    });
    return Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b);
  }, [members]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.4, prev + delta), 2.2));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 30 });
  };

  // Center on highlight node if changed
  useEffect(() => {
    if (highlightId) {
      const el = document.getElementById(`tree-node-${highlightId}`);
      if (el && containerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [highlightId]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tree-node-interactive')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch pan handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('.tree-node-interactive')) return;
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isCollapsed = !!collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isHighlighted = highlightId === node.id;

    // Fallback avatar
    const defaultAvatar =
      node.gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80';

    return (
      <div key={node.id} className="flex flex-col items-center relative">
        {/* Member Card */}
        <div
          id={`tree-node-${node.id}`}
          onClick={() => onSelectMember(node.id)}
          className={`tree-node-interactive group relative z-10 w-64 sm:w-72 bg-stone-900/95 border-2 rounded-xl p-3 shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${
            isHighlighted
              ? 'border-amber-400 ring-4 ring-amber-400/30 scale-105 bg-stone-900'
              : node.is_alive === 1
              ? 'border-amber-700/60 hover:border-amber-500'
              : 'border-stone-700/80 hover:border-stone-500 bg-stone-950/90'
          }`}
        >
          {/* Generation & Status Badges */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
              Đời thứ {node.generation}
            </span>
            <div className="flex items-center gap-1.5">
              {node.branch && (
                <span className="text-[10px] text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 truncate max-w-[90px]">
                  {node.branch}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${
                  node.is_alive === 1
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${node.is_alive === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`}
                />
                {node.is_alive === 1 ? 'Còn sống' : 'Đã mất'}
              </span>
            </div>
          </div>

          {/* Member Main Row: Avatar + Info */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={node.avatar_url || defaultAvatar}
                alt={node.full_name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-600/60 shadow-md group-hover:border-amber-400 transition-colors"
              />
              {node.gender === 'female' ? (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-900 border border-rose-600 flex items-center justify-center text-[9px] text-rose-300 font-bold">
                  ♀
                </span>
              ) : (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-900 border border-blue-600 flex items-center justify-center text-[9px] text-blue-300 font-bold">
                  ♂
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                {node.full_name}
              </h3>
              
              <p className="text-xs text-stone-300 mt-0.5 font-mono">
                {node.birth_year ? `Năm sinh: ${node.birth_year}` : (node.birth_date || 'Năm sinh: Chưa rõ')}
                {node.is_alive === 0 && node.death_date && ` - Mất: ${node.death_date.slice(0, 4)}`}
              </p>

              {node.occupation && (
                <p className="text-[11px] text-stone-400 truncate mt-0.5" title={node.occupation}>
                  {node.occupation}
                </p>
              )}
            </div>
          </div>

          {/* Spouse / Vợ hoặc Chồng Row */}
          {node.spouse_name && (
            <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center gap-1.5 text-xs text-rose-300/90">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400 shrink-0" />
              <span className="truncate">
                {node.gender === 'female' ? 'Chồng' : 'Vợ'}: <span className="font-medium text-stone-200">{node.spouse_name}</span>
              </span>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1 text-amber-400 group-hover:underline">
              <Info className="w-3 h-3" /> Chi tiết
            </span>

            <div className="flex items-center gap-2">
              {canEdit && onAddChild && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node.id);
                  }}
                  title="Thêm con cho thành viên này"
                  className="flex items-center gap-0.5 text-stone-300 hover:text-amber-400 p-1 rounded hover:bg-stone-800"
                >
                  <Plus className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px]">Thêm con</span>
                </button>
              )}

              {hasChildren && (
                <button
                  onClick={(e) => toggleCollapse(node.id, e)}
                  title={isCollapsed ? 'Mở rộng con cháu' : 'Thu gọn nhánh'}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium"
                >
                  <span>{node.children.length} con</span>
                  {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children Subtree with SVG Connectors */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector downward from parent */}
            <div className="w-0.5 h-8 bg-amber-700/80" />

            {/* Horizontal branch bar and children */}
            <div className="flex justify-center relative pt-2">
              {node.children.map((child, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === node.children.length - 1;
                const isOnly = node.children.length === 1;

                return (
                  <div key={child.id} className="flex flex-col items-center px-4 sm:px-6 relative">
                    {/* Top Horizontal Connector Line */}
                    {!isOnly && (
                      <div
                        className={`absolute top-0 h-0.5 bg-amber-700/80 ${
                          isFirst
                            ? 'left-1/2 right-0'
                            : isLast
                            ? 'left-0 right-1/2'
                            : 'left-0 right-0'
                        }`}
                      />
                    )}
                    {/* Vertical Connector down to child */}
                    <div className="w-0.5 h-6 bg-amber-700/80" />

                    {renderTreeNode(child, depth + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] lg:h-[calc(100vh-4.5rem)] bg-stone-950 overflow-hidden select-none">
      {/* Background Subtle Traditional Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#d97706 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />

      {/* Floating Control Bar */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-stone-900/90 backdrop-blur border border-stone-800 p-1.5 rounded-xl shadow-xl">
        <button
          id="btn-zoom-in"
          onClick={() => handleZoom(0.15)}
          title="Phóng to (+)"
          className="p-2 hover:bg-stone-800 active:bg-stone-700 text-stone-200 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={() => handleZoom(-0.15)}
          title="Thu nhỏ (-)"
          className="p-2 hover:bg-stone-800 active:bg-stone-700 text-stone-200 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          onClick={resetView}
          title="Căn giữa & 100%"
          className="p-2 hover:bg-stone-800 active:bg-stone-700 text-stone-200 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="text-[10px] text-center text-stone-400 font-mono py-1 border-t border-stone-800">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Generation Level Jump Chips */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 max-w-full overflow-x-auto p-1.5 bg-stone-900/90 backdrop-blur border border-stone-800 rounded-xl shadow-xl scrollbar-none">
        <span className="text-[11px] font-semibold text-amber-400 px-2 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5" /> Các Thế Hệ:
        </span>
        {generations.map((gen) => (
          <button
            key={gen}
            id={`btn-jump-gen-${gen}`}
            onClick={() => {
              const firstMember = members.find((m) => m.generation === gen);
              if (firstMember) {
                const el = document.getElementById(`tree-node-${firstMember.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              }
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-stone-800 hover:bg-amber-950/70 hover:text-amber-300 text-stone-300 border border-stone-700 font-medium shrink-0 transition-colors"
          >
            Đời {gen}
          </button>
        ))}
      </div>

      {/* Touch/Mouse Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full cursor-grab active:cursor-grabbing overflow-auto p-10 sm:p-20 flex justify-center items-start ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="inline-flex flex-col items-center min-w-max pb-32"
        >
          {treeRoots.length === 0 ? (
            <div className="text-center p-12 bg-stone-900/80 border border-stone-800 rounded-2xl max-w-md mt-20">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-lg font-bold text-stone-100 mb-1">Chưa có thành viên</h3>
              <p className="text-xs text-stone-400 mb-4">
                Hãy bắt đầu tạo gia phả bằng cách thêm Thủy tổ hoặc thành viên đầu tiên của dòng họ.
              </p>
            </div>
          ) : (
            <div className="flex gap-16 justify-center">
              {treeRoots.map((root) => renderTreeNode(root, 0))}
            </div>
          )}
        </div>
      </div>

      {/* Guide hint at bottom */}
      <div className="absolute bottom-16 lg:bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 text-xs text-stone-400 bg-stone-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-stone-800">
        <Move className="w-3.5 h-3.5 text-amber-400" />
        <span>Kéo để di chuyển • Lăn chuột hoặc chạm để phóng to/thu nhỏ • Nhấn vào thẻ để xem chi tiết</span>
      </div>
    </div>
  );
};
