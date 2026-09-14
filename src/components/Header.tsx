import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Users,
  Network,
  List,
  BarChart3,
  BookOpen,
  Settings,
  Plus,
  FileDown,
  LogIn,
  LogOut,
  ShieldCheck,
  X,
  UserCheck,
  ArrowLeft,
  Share2,
  Code2,
} from 'lucide-react';
import { ClanInfo, Member, User } from '../types.ts';
import { getClanTheme } from '../theme.ts';

interface HeaderProps {
  clan: ClanInfo | null;
  currentUser: User | null;
  currentView: 'tree' | 'list' | 'stats' | 'landing' | 'docs';
  onViewChange: (view: 'tree' | 'list' | 'stats' | 'landing' | 'docs') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAdminConfig: () => void;
  onOpenAddMember: () => void;
  onExportPDF: () => void;
  onOpenShare?: () => void;
  members: Member[];
  onSelectMember: (id: string) => void;
  totalGenerations: number;
}

export const Header: React.FC<HeaderProps> = ({
  clan,
  currentUser,
  currentView,
  onViewChange,
  onOpenLogin,
  onLogout,
  onOpenAdminConfig,
  onOpenAddMember,
  onExportPDF,
  onOpenShare,
  members,
  onSelectMember,
  totalGenerations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.role === 'admin';
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  // Fast client-side filtering for live search autocomplete
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return members
      .filter((m) => {
        const nameMatch = m.full_name.toLowerCase().includes(q);
        const yearMatch = m.birth_year ? String(m.birth_year).includes(q) : false;
        const occMatch = m.occupation ? m.occupation.toLowerCase().includes(q) : false;
        const addrMatch = m.address ? m.address.toLowerCase().includes(q) : false;
        const spouseMatch = m.spouse_name ? m.spouse_name.toLowerCase().includes(q) : false;
        return nameMatch || yearMatch || occMatch || addrMatch || spouseMatch;
      })
      .slice(0, 8); // Top 8 fast results
  }, [searchQuery, members]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        (!searchRef.current || !searchRef.current.contains(target)) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(target))
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const theme = getClanTheme(clan);

  const renderDropdownResults = () => {
    if (!isSearchOpen || !searchQuery.trim()) return null;
    return (
      <div className="absolute left-0 right-0 top-full mt-1.5 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
        <div className="p-2 border-b border-stone-800 text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
          Kết quả tìm kiếm ({searchResults.length})
        </div>
        {searchResults.length === 0 ? (
          <div className="p-4 text-center text-xs text-stone-400">
            Không tìm thấy thành viên nào khớp với "<span className="text-amber-300">{searchQuery}</span>"
          </div>
        ) : (
          <div className="divide-y divide-stone-800/50">
            {searchResults.map((m) => (
              <button
                key={m.id}
                id={`search-item-${m.id}`}
                onClick={() => {
                  onSelectMember(m.id);
                  setIsSearchOpen(false);
                  setIsMobileSearchActive(false);
                  setSearchQuery('');
                }}
                className="w-full p-2.5 flex items-center gap-3 hover:bg-stone-800/80 transition-colors text-left"
              >
                <img
                  src={
                    m.avatar_url ||
                    (m.gender === 'female'
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80')
                  }
                  alt={m.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-stone-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-stone-100 truncate">
                      {m.full_name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/50 shrink-0">
                      Đời {m.generation}
                    </span>
                    {m.is_alive === 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 border border-stone-700 shrink-0">
                        Đã mất
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate flex items-center gap-2 mt-0.5">
                    {m.birth_year ? `Sinh năm ${m.birth_year}` : m.birth_date || 'Chưa rõ năm sinh'}
                    {m.occupation && <span>• {m.occupation}</span>}
                    {m.address && <span>• {m.address}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur border-b shadow-md transition-colors duration-300 ${theme.bg.headerClass}`}>
      <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-5 lg:px-6">
        {/* Mobile Fullscreen Search Bar */}
        {isMobileSearchActive ? (
          <div ref={mobileSearchRef} className="flex md:hidden items-center gap-2 h-16 w-full animate-in fade-in duration-150 relative">
            <button
              type="button"
              id="btn-close-mobile-search"
              onClick={() => {
                setIsMobileSearchActive(false);
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors shrink-0"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="mobile-genealogy-search-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Tìm theo họ tên, năm sinh..."
                className="w-full pl-9 pr-8 py-2 bg-stone-800/95 border border-amber-600/60 focus:border-amber-500 rounded-lg text-xs text-stone-100 placeholder-stone-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {renderDropdownResults()}
          </div>
        ) : (
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4 lg:gap-5">
            {/* Logo & Clan Title - NEVER squeezed on mobile */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0 max-w-[210px] sm:max-w-[260px] xl:max-w-xs">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 ${theme.logoShape} bg-gradient-to-br ${theme.color.gradient} p-0.5 shadow-lg shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300`}
              >
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt="Logo Dòng Họ"
                    className={`w-full h-full object-cover ${theme.logoShape}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className={`w-full h-full ${theme.bg.isDark ? 'bg-stone-950/85' : 'bg-white/90'} ${theme.logoShape} flex items-center justify-center font-bold text-base sm:text-xl ${theme.color.textAccent}`}
                  >
                    {theme.logoText || '氏'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className={`text-sm sm:text-base md:text-lg font-bold tracking-wide truncate ${theme.bg.isDark ? theme.color.textTitle : 'text-stone-900'}`}
                >
                  {clan?.name || 'Gia Phả Đại Tộc'}
                </h1>
                <p className={`text-[10px] sm:text-xs truncate ${theme.bg.textMuted}`}>
                  {clan?.ancestor_name ? `Thủy tổ: ${clan.ancestor_name}` : 'Hệ thống quản lý phả hệ dòng tộc'}
                </p>
              </div>
            </div>

            {/* Quick Search Bar (Desktop & Tablet only) - compact to leave space for nav */}
            <div ref={searchRef} className="hidden md:block relative shrink min-w-[140px] max-w-[190px] xl:max-w-[240px] 2xl:max-w-[280px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="genealogy-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Tìm thành viên, năm..."
                  className="w-full pl-9 pr-8 py-2 bg-stone-800/90 hover:bg-stone-800 focus:bg-stone-900 border border-stone-700 focus:border-amber-500 rounded-lg text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {renderDropdownResults()}
            </div>

            {/* Desktop Navigation View Tabs - Wide, no line breaks */}
            <nav
              className={`hidden lg:flex items-center p-1 rounded-xl border transition-colors shrink-0 whitespace-nowrap gap-1 xl:gap-1.5 shadow-sm ${
                theme.bg.isDark
                  ? 'bg-stone-900/90 border-stone-800'
                  : 'bg-stone-200/90 border-stone-300'
              }`}
            >
              <button
                id="tab-tree-view"
                onClick={() => onViewChange('tree')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  currentView === 'tree'
                    ? `${theme.color.primaryBtn} shadow`
                    : theme.bg.isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/80'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Sơ đồ Cây</span>
              </button>
              <button
                id="tab-list-view"
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  currentView === 'list'
                    ? `${theme.color.primaryBtn} shadow`
                    : theme.bg.isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/80'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách ({members.length})</span>
              </button>
              <button
                id="tab-stats-view"
                onClick={() => onViewChange('stats')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  currentView === 'stats'
                    ? `${theme.color.primaryBtn} shadow`
                    : theme.bg.isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/80'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Thống kê</span>
              </button>
              <button
                id="tab-landing-view"
                onClick={() => onViewChange('landing')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  currentView === 'landing'
                    ? `${theme.color.primaryBtn} shadow`
                    : theme.bg.isDark
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Giới thiệu Họ Phạm</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  id="tab-docs-view"
                  onClick={() => onViewChange('docs')}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    currentView === 'docs'
                      ? `${theme.color.primaryBtn} shadow`
                      : theme.bg.isDark
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/80'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Docs API</span>
                </button>
              )}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Search Button Trigger */}
              <button
                id="btn-open-mobile-search"
                type="button"
                onClick={() => {
                  setIsMobileSearchActive(true);
                  setIsSearchOpen(true);
                }}
                title="Tìm kiếm gia phả"
                className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Export PDF Button */}
              <button
                id="btn-export-pdf"
                onClick={onExportPDF}
                title="Xuất gia phả định dạng PDF"
                className={`h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 border rounded-lg text-xs font-medium transition-colors ${
                  theme.bg.isDark
                    ? 'bg-stone-850 bg-stone-900 hover:bg-stone-800 border-stone-750 border-stone-800 text-stone-200'
                    : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-800 shadow-xs'
                }`}
              >
                <FileDown className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Xuất PDF</span>
              </button>

              {/* Social Share Button */}
              {onOpenShare && (
                <button
                  id="btn-social-share-header"
                  type="button"
                  onClick={onOpenShare}
                  title="Chia sẻ Cổng Gia Phả lên mạng xã hội"
                  className={`h-9 hidden sm:inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 border rounded-lg text-xs font-medium transition-colors ${
                    theme.bg.isDark
                      ? 'bg-stone-900 hover:bg-stone-800 border-stone-800 text-amber-300 hover:text-amber-200'
                      : 'bg-white hover:bg-stone-100 border-stone-300 text-amber-700 shadow-xs'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Chia sẻ MXH</span>
                </button>
              )}

              {/* Add Member (Admin / Editor) - Hidden on mobile, as it is in MobileNav */}
              {canEdit && (
                <button
                  id="btn-add-member"
                  onClick={onOpenAddMember}
                  className={`hidden md:inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 h-9 ${theme.color.primaryBtn} font-medium rounded-lg text-xs shadow-md transition-all active:scale-95`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thành Viên</span>
                </button>
              )}

              {/* Admin Configuration Button (Admin Only) - Hidden on mobile, as it is in MobileNav */}
              {isAdmin && (
                <button
                  id="btn-admin-config"
                  onClick={onOpenAdminConfig}
                  title="Cấu hình hệ thống, giao diện & người dùng"
                  className={`hidden md:inline-flex h-9 w-9 items-center justify-center ${theme.color.secondaryBtn} rounded-lg text-xs transition-colors`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              {/* Authentication Button */}
              {currentUser ? (
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1">
                  <div className="hidden md:flex flex-col text-right leading-tight">
                    <span className="text-xs font-semibold text-stone-200 truncate max-w-[110px]">
                      {currentUser.full_name}
                    </span>
                  </div>
                  <button
                    id="btn-logout"
                    onClick={onLogout}
                    title="Đăng xuất"
                    className="h-9 w-9 hidden sm:inline-flex items-center justify-center bg-stone-800 hover:bg-rose-950/60 hover:text-rose-400 border border-stone-700 rounded-lg text-stone-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="btn-open-login"
                  onClick={onOpenLogin}
                  className="h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
