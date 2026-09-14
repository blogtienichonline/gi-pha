import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Heart,
  Plus,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  CheckSquare,
  Square,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Member } from '../types.ts';
import { api } from '../services/api.ts';

interface MemberListViewProps {
  members: Member[];
  onSelectMember: (id: string) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string, name: string) => void;
  onAddMember: () => void;
  canEdit: boolean;
  isAdmin: boolean;
  onOpenBulkManager?: () => void;
  onRefreshData?: () => void;
  showToast?: (message: string) => void;
}

export const MemberListView: React.FC<MemberListViewProps> = ({
  members,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddMember,
  canEdit,
  isAdmin,
  onOpenBulkManager,
  onRefreshData,
  showToast,
}) => {
  const [filterGen, setFilterGen] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'generation' | 'name' | 'birthYear'>('generation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Bulk selection state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [unlinkChildren, setUnlinkChildren] = useState(true);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.has(m.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)));
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await api.bulkDeleteMembers(Array.from(selectedIds) as string[], unlinkChildren);
      if (res.success) {
        setShowBulkDeleteModal(false);
        const count = selectedIds.size;
        setSelectedIds(new Set());
        setIsBulkMode(false);
        if (showToast) {
          showToast(`Đã xóa thành công ${count} thành viên khỏi gia phả!`);
        }
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        alert(res.message || 'Lỗi khi xóa thành viên.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối khi xóa thành viên.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterGen !== 'all') count++;
    if (filterGender !== 'all') count++;
    if (filterStatus !== 'all') count++;
    if (filterBranch !== 'all') count++;
    if (sortBy !== 'generation' || sortOrder !== 'asc') count++;
    return count;
  }, [filterGen, filterGender, filterStatus, filterBranch, sortBy, sortOrder]);

  const resetAllFilters = () => {
    setFilterGen('all');
    setFilterGender('all');
    setFilterStatus('all');
    setFilterBranch('all');
    setSortBy('generation');
    setSortOrder('asc');
    setLocalSearch('');
  };

  // Available unique generations and branches
  const generations = useMemo(() => {
    const set = new Set<number>();
    members.forEach((m) => set.add(m.generation));
    return Array.from(set).sort((a, b) => a - b);
  }, [members]);

  const branches = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.branch) set.add(m.branch);
    });
    return Array.from(set);
  }, [members]);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Generation filter
        if (filterGen !== 'all' && m.generation !== parseInt(filterGen, 10)) {
          return false;
        }
        // Gender filter
        if (filterGender !== 'all' && m.gender !== filterGender) {
          return false;
        }
        // Status filter
        if (filterStatus === 'alive' && m.is_alive !== 1) return false;
        if (filterStatus === 'deceased' && m.is_alive !== 0) return false;
        // Branch filter
        if (filterBranch !== 'all' && m.branch !== filterBranch) return false;

        // Search text
        if (localSearch.trim()) {
          const q = localSearch.toLowerCase().trim();
          const nameMatch = m.full_name.toLowerCase().includes(q);
          const yearMatch = m.birth_year ? String(m.birth_year).includes(q) : false;
          const occMatch = m.occupation ? m.occupation.toLowerCase().includes(q) : false;
          const addrMatch = m.address ? m.address.toLowerCase().includes(q) : false;
          const spouseMatch = m.spouse_name ? m.spouse_name.toLowerCase().includes(q) : false;
          return nameMatch || yearMatch || occMatch || addrMatch || spouseMatch;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'generation') {
          diff = a.generation - b.generation || (a.birth_order || 1) - (b.birth_order || 1);
        } else if (sortBy === 'name') {
          diff = a.full_name.localeCompare(b.full_name, 'vi');
        } else if (sortBy === 'birthYear') {
          diff = (a.birth_year || 9999) - (b.birth_year || 9999);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [members, filterGen, filterGender, filterStatus, filterBranch, localSearch, sortBy, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5 pb-24 lg:pb-12">
      {/* Top Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg space-y-2 sm:space-y-3">
        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch md:items-center justify-between">
          {/* Quick Filter Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Lọc nhanh họ tên, năm sinh, nghề nghiệp, nơi ở..."
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-stone-950 border border-stone-700 rounded-lg sm:rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-0.5"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons: Bulk operations & Add member */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkMode(!isBulkMode);
                    if (isBulkMode) setSelectedIds(new Set());
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-semibold shadow transition-all ${
                    isBulkMode
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  }`}
                  title="Chọn nhiều thành viên để thực hiện thao tác"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBulkMode ? 'Hủy chọn nhiều' : 'Chọn nhiều'}</span>
                  {selectedIds.size > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                      {selectedIds.size}
                    </span>
                  )}
                </button>

                {onOpenBulkManager && (
                  <button
                    type="button"
                    onClick={onOpenBulkManager}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-800/60 rounded-lg sm:rounded-xl text-xs font-semibold shadow transition-colors"
                    title="Mở bảng thêm / xóa thành viên hàng loạt"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Quản lý hàng loạt</span>
                  </button>
                )}
              </>
            )}

            {canEdit && (
              <button
                onClick={onAddMember}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg sm:rounded-xl text-xs font-semibold shadow shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thành Viên</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Sorting Row (Selected element: div:nth-of-type(2)) */}
        <div className="pt-2 border-t border-stone-800 text-xs">
          {/* Mobile Filter Toggle & Quick Info */}
          <div className="md:hidden flex items-center justify-between gap-2">
            <button
              type="button"
              id="btn-toggle-mobile-filters"
              onClick={() => setIsMobileFilterOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 text-xs font-medium active:scale-95 transition-all"
            >
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Bộ lọc & Sắp xếp</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isMobileFilterOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
              )}
            </button>

            {/* Quick Reset on Mobile if active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-stone-950/70 border border-amber-900/40"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Active filter pills summary on mobile when collapsed */}
          {!isMobileFilterOpen && activeFiltersCount > 0 && (
            <div className="md:hidden flex flex-wrap gap-1.5 mt-2 pt-1.5 border-t border-stone-800/40">
              {filterGen !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px]">
                  Đời {filterGen}
                  <button onClick={() => setFilterGen('all')}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filterGender !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px]">
                  {filterGender === 'male' ? 'Nam' : 'Nữ'}
                  <button onClick={() => setFilterGender('all')}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px]">
                  {filterStatus === 'alive' ? 'Còn sống' : 'Đã quy tiên'}
                  <button onClick={() => setFilterStatus('all')}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filterBranch !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/60 text-amber-300 text-[10px]">
                  {filterBranch}
                  <button onClick={() => setFilterBranch('all')}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Filters List: Collapsible on mobile, always visible on tablet/desktop */}
          <div
            className={`${
              isMobileFilterOpen ? 'grid grid-cols-2 gap-1.5 mt-2.5' : 'hidden'
            } md:flex md:flex-wrap md:items-center md:gap-2 md:mt-0`}
          >
            <div className="hidden md:flex items-center gap-1 text-stone-400 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Bộ lọc:</span>
            </div>

            {/* Filter: Thế hệ */}
            <select
              value={filterGen}
              onChange={(e) => setFilterGen(e.target.value)}
              className="w-full md:w-auto h-8 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 text-xs"
            >
              <option value="all">Tất cả thế hệ</option>
              {generations.map((g) => (
                <option key={g} value={g}>
                  Đời thứ {g}
                </option>
              ))}
            </select>

            {/* Filter: Giới tính */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full md:w-auto h-8 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 text-xs"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="male">Nam ♂</option>
              <option value="female">Nữ ♀</option>
            </select>

            {/* Filter: Tình trạng */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-auto h-8 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 text-xs"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="alive">Còn sống</option>
              <option value="deceased">Đã quy tiên</option>
            </select>

            {/* Filter: Chi nhánh */}
            {branches.length > 0 && (
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full md:w-auto h-8 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 text-xs"
              >
                <option value="all">Tất cả các chi</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}

            {/* Sắp xếp */}
            <div className="col-span-2 md:col-span-1 md:ml-auto flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-start">
              <span className="text-stone-400 hidden md:inline">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 md:flex-initial h-8 px-2 py-1 bg-stone-950 border border-stone-700 rounded-lg text-stone-200 text-xs focus:border-amber-500"
              >
                <option value="generation">Theo Đời thứ</option>
                <option value="name">Theo Tên (A-Z)</option>
                <option value="birthYear">Theo Năm sinh</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="h-8 w-8 inline-flex items-center justify-center bg-stone-950 border border-stone-700 rounded-lg text-stone-300 hover:text-amber-400 active:scale-95 transition-colors shrink-0"
                title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Reset Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="hidden md:inline-flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 px-2 py-1 rounded hover:bg-stone-800 transition-colors ml-1"
                title="Xóa toàn bộ bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-stone-400 px-1">
        <span>
          Hiển thị <strong className="text-amber-400">{filteredMembers.length}</strong> / {members.length} thành viên
        </span>
      </div>

      {/* Member Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-stone-900 border border-stone-800 rounded-2xl">
          <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-200 mb-1">Không có thành viên phù hợp</h3>
          <p className="text-xs text-stone-400">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => {
            const defaultAvatar =
              m.gender === 'female'
                ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

            return (
              <div
                key={m.id}
                id={`member-card-${m.id}`}
                onClick={() => {
                  if (isBulkMode) toggleSelectMember(m.id);
                }}
                className={`bg-stone-900 border ${
                  selectedIds.has(m.id)
                    ? 'border-red-500 bg-red-950/20'
                    : 'border-stone-800 hover:border-amber-700/60'
                } rounded-xl p-4 shadow transition-all hover:shadow-xl flex flex-col justify-between group ${
                  isBulkMode ? 'cursor-pointer' : ''
                }`}
              >
                <div>
                  {/* Top row: Badges & Bulk Checkbox */}
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <div className="flex items-center gap-1.5">
                      {isBulkMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectMember(m.id);
                          }}
                          className="text-stone-400 hover:text-white shrink-0 p-0.5"
                          title={selectedIds.has(m.id) ? 'Bỏ chọn' : 'Chọn thành viên'}
                        >
                          {selectedIds.has(m.id) ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-600" />
                          )}
                        </button>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
                        Đời thứ {m.generation}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {m.branch && (
                        <span className="text-[10px] text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 truncate max-w-[100px]">
                          {m.branch}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          m.is_alive === 1
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}
                      >
                        {m.is_alive === 1 ? 'Còn sống' : 'Đã quy tiên'}
                      </span>
                    </div>
                  </div>

                  {/* Main Info: Avatar + Details */}
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={m.avatar_url || defaultAvatar}
                        alt={m.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-stone-700 group-hover:border-amber-500 transition-colors"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                          m.gender === 'female'
                            ? 'bg-rose-950 text-rose-300 border-rose-700'
                            : 'bg-blue-950 text-blue-300 border-blue-700'
                        }`}
                      >
                        {m.gender === 'female' ? '♀' : '♂'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => onSelectMember(m.id)}
                        className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors truncate cursor-pointer"
                      >
                        {m.full_name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-0.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {m.birth_year ? `Năm ${m.birth_year}` : (m.birth_date || 'Chưa rõ năm')}
                          {m.is_alive === 0 && m.death_date && ` - Mất ${m.death_date.slice(0, 4)}`}
                        </span>
                      </div>

                      {m.occupation && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-1 truncate">
                          <Briefcase className="w-3 h-3 text-stone-500 shrink-0" />
                          <span className="truncate">{m.occupation}</span>
                        </div>
                      )}

                      {m.address && (
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                          <span className="truncate">{m.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spouse row if present */}
                  {m.spouse_name && (
                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center gap-1.5 text-xs text-rose-300/90 truncate">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20 shrink-0" />
                      <span className="truncate">
                        {m.gender === 'female' ? 'Chồng' : 'Vợ'}: <span className="font-medium text-stone-200">{m.spouse_name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectMember(m.id)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        onClick={() => onEditMember(m)}
                        className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onDeleteMember(m.id, m.full_name)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                        title="Xóa thành viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Floating Bulk Action Bar */}
      {isBulkMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md border border-stone-700 rounded-2xl shadow-2xl px-4 py-2.5 flex items-center gap-3 text-xs max-w-[95vw] sm:max-w-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 text-stone-200 shrink-0">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span>
              Đã chọn: <strong className="text-amber-300 font-bold">{selectedIds.size}</strong> người
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700 shrink-0" />

          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className="text-stone-300 hover:text-white hover:underline text-xs shrink-0"
          >
            {filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.has(m.id))
              ? 'Bỏ chọn tất cả'
              : `Chọn tất cả (${filteredMembers.length})`}
          </button>

          <button
            type="button"
            onClick={() => setShowBulkDeleteModal(true)}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-lg shadow transition-all active:scale-95 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa {selectedIds.size} thành viên</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              setIsBulkMode(false);
            }}
            className="text-stone-400 hover:text-stone-200 p-1 shrink-0"
            title="Đóng chế độ chọn nhiều"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bulk Delete Confirm Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-stone-900 border border-red-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-stone-100">
            <div className="flex items-center gap-2.5 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/80 border border-red-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-200">Xác Nhận Xóa Hàng Loạt</h4>
                <p className="text-[11px] text-stone-400">Hành động này sẽ xóa vĩnh viễn khỏi phả hệ</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Bạn đang chuẩn bị xóa <strong className="text-red-400 font-bold text-sm">{selectedIds.size}</strong> thành viên đã chọn.
            </p>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unlinkChildren}
                onChange={(e) => setUnlinkChildren(e.target.checked)}
                className="rounded border-stone-700 text-amber-500 focus:ring-0"
              />
              <span>Tự động gỡ liên kết phụ thuộc cha/con đối với các con còn lại</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác Nhận Xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
