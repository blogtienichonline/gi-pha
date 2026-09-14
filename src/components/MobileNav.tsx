import React from 'react';
import { Network, List, BarChart3, Plus, Settings, UserCheck, LogIn } from 'lucide-react';
import { User } from '../types.ts';

interface MobileNavProps {
  currentView: 'tree' | 'list' | 'stats' | 'landing' | 'docs';
  onViewChange: (view: 'tree' | 'list' | 'stats' | 'landing' | 'docs') => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout?: () => void;
  onOpenAdminConfig: () => void;
  onOpenAddMember: () => void;
  totalMembers: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onViewChange,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenAdminConfig,
  onOpenAddMember,
  totalMembers,
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Thanh điều hướng di động"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 shadow-2xl px-2 py-1"
    >
      <div
        className={`max-w-lg mx-auto grid items-end ${
          canEdit ? 'grid-cols-5' : 'grid-cols-4'
        }`}
      >
        {/* 1. Sơ đồ cây */}
        <button
          id="mobile-nav-tree"
          type="button"
          onClick={() => onViewChange('tree')}
          className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            currentView === 'tree'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative flex items-center justify-center w-6 h-6 mb-1">
            <Network className="w-5 h-5" />
            {currentView === 'tree' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight text-center">Sơ đồ cây</span>
        </button>

        {/* 2. Danh sách thành viên */}
        <button
          id="mobile-nav-list"
          type="button"
          onClick={() => onViewChange('list')}
          className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            currentView === 'list'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative flex items-center justify-center w-6 h-6 mb-1">
            <List className="w-5 h-5" />
            {totalMembers > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center justify-center">
                {totalMembers}
              </span>
            )}
            {currentView === 'list' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight text-center">Danh sách</span>
        </button>

        {/* 3. Nút Thêm Thành Viên (Can Edit) */}
        {canEdit && (
          <div className="w-full flex flex-col items-center justify-center pb-1">
            <button
              id="mobile-nav-add"
              type="button"
              onClick={onOpenAddMember}
              aria-label="Thêm thành viên mới"
              className="w-11 h-11 -mt-4 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-950/60 border-2 border-stone-900 active:scale-90 transition-transform"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-semibold leading-tight text-amber-400 mt-1 text-center">
              Thêm
            </span>
          </div>
        )}

        {/* 4. Thống kê */}
        <button
          id="mobile-nav-stats"
          type="button"
          onClick={() => onViewChange('stats')}
          className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            currentView === 'stats'
              ? 'text-amber-400 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative flex items-center justify-center w-6 h-6 mb-1">
            <BarChart3 className="w-5 h-5" />
            {currentView === 'stats' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>
          <span className="text-[10px] leading-tight tracking-tight text-center">Thống kê</span>
        </button>

        {/* 5. Quản trị hoặc Đăng nhập */}
        {isAdmin ? (
          <button
            id="mobile-nav-admin"
            type="button"
            onClick={onOpenAdminConfig}
            className="w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-amber-500 hover:text-amber-400 transition-all"
          >
            <div className="flex items-center justify-center w-6 h-6 mb-1">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-tight tracking-tight text-center font-medium">
              Quản trị
            </span>
          </button>
        ) : (
          <button
            id="mobile-nav-login"
            type="button"
            onClick={() => {
              if (currentUser && onLogout) {
                if (window.confirm(`Đăng xuất khỏi tài khoản "${currentUser.full_name || currentUser.username}"?`)) {
                  onLogout();
                }
              } else {
                onOpenLogin();
              }
            }}
            className="w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-stone-200 transition-all"
            title={currentUser ? `Đang đăng nhập: ${currentUser.full_name} (Nhấn để đăng xuất)` : 'Đăng nhập'}
          >
            <div className="flex items-center justify-center w-6 h-6 mb-1">
              {currentUser ? (
                <UserCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] leading-tight tracking-tight text-center">
              {currentUser ? 'Đăng xuất' : 'Đăng nhập'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
