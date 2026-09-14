import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Search,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  HelpCircle,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Member } from '../types.ts';
import { api } from '../services/api.ts';

interface BulkMemberManagerProps {
  members: Member[];
  onRefreshData: () => void;
  onClose?: () => void;
}

interface DraftRow {
  id: string;
  full_name: string;
  gender: 'male' | 'female';
  birth_year: string;
  generation: number;
  parent_id: string;
  branch: string;
  occupation: string;
  address: string;
}

export const BulkMemberManager: React.FC<BulkMemberManagerProps> = ({
  members,
  onRefreshData,
}) => {
  const [subTab, setSubTab] = useState<'add' | 'delete' | 'pham-demo'>('add');

  // -------------------------------------------------------------
  // BULK ADD STATE
  // -------------------------------------------------------------
  const [addMode, setAddMode] = useState<'table' | 'text'>('table');
  const [tableRows, setTableRows] = useState<DraftRow[]>([
    {
      id: 'row_1',
      full_name: 'Phạm Quang Vinh',
      gender: 'male',
      birth_year: '1985',
      generation: 3,
      parent_id: '',
      branch: 'Chi Trưởng',
      occupation: 'Kỹ sư Xây dựng',
      address: 'Hà Nội',
    },
    {
      id: 'row_2',
      full_name: 'Phạm Thị Thúy Hằng',
      gender: 'female',
      birth_year: '1988',
      generation: 3,
      parent_id: '',
      branch: 'Chi Trưởng',
      occupation: 'Giáo viên',
      address: 'Hà Nội',
    },
  ]);

  const [rawText, setRawText] = useState(
`Phạm Văn Hưng, Nam, 1992, 3, Chi Hai, Kỹ sư phần mềm, Hà Nội
Phạm Thị Mai Phương, Nữ, 1995, 3, Chi Hai, Kế toán, Hải Dương
Phạm Hoàng Nam, Nam, 2020, 4, Chi Trưởng, Mầm non, Hà Nội`
  );

  const [addLoading, setAddLoading] = useState(false);
  const [addFeedback, setAddFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // -------------------------------------------------------------
  // BULK DELETE STATE
  // -------------------------------------------------------------
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(new Set());
  const [deleteSearch, setDeleteSearch] = useState('');
  const [deleteFilterGen, setDeleteFilterGen] = useState<string>('all');
  const [unlinkChildren, setUnlinkChildren] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // -------------------------------------------------------------
  // RESET DEMO PHAM STATE
  // -------------------------------------------------------------
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Parent options list for dropdown
  const parentOptions = useMemo(() => {
    return members
      .filter((m) => m.gender === 'male' || !m.gender)
      .sort((a, b) => a.generation - b.generation || a.full_name.localeCompare(b.full_name, 'vi'));
  }, [members]);

  // Generations list
  const generations = useMemo(() => {
    const s = new Set<number>();
    members.forEach((m) => s.add(m.generation));
    return Array.from(s).sort((a, b) => a - b);
  }, [members]);

  // Filtered members for delete list
  const filteredDeleteMembers = useMemo(() => {
    return members.filter((m) => {
      if (deleteFilterGen !== 'all' && m.generation !== Number(deleteFilterGen)) return false;
      if (deleteSearch.trim()) {
        const q = deleteSearch.toLowerCase();
        return (
          m.full_name.toLowerCase().includes(q) ||
          (m.birth_year && String(m.birth_year).includes(q)) ||
          (m.branch && m.branch.toLowerCase().includes(q)) ||
          (m.address && m.address.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [members, deleteFilterGen, deleteSearch]);

  // -------------------------------------------------------------
  // ROW ACTIONS (ADD TABLE)
  // -------------------------------------------------------------
  const addRow = () => {
    setTableRows((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        full_name: '',
        gender: 'male',
        birth_year: '',
        generation: 3,
        parent_id: '',
        branch: 'Chi Trưởng',
        occupation: '',
        address: '',
      },
    ]);
  };

  const addMultipleRows = (count: number) => {
    const newRows: DraftRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: `row_${Date.now()}_${i}`,
        full_name: '',
        gender: 'male',
        birth_year: '',
        generation: 3,
        parent_id: '',
        branch: '',
        occupation: '',
        address: '',
      });
    }
    setTableRows((prev) => [...prev, ...newRows]);
  };

  const removeRow = (rowId: string) => {
    setTableRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const updateRow = (rowId: string, field: keyof DraftRow, value: any) => {
    setTableRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Parse text input into table rows
  const handleParseTextToRows = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: DraftRow[] = [];

    lines.forEach((line, idx) => {
      // split by comma or semicolon or pipe
      const parts = line.split(/[,;|]/).map((p) => p.trim());
      if (!parts[0]) return;

      const fullName = parts[0] || '';
      const genderRaw = parts[1]?.toLowerCase() || 'nam';
      const gender = genderRaw.includes('nữ') || genderRaw.includes('nu') || genderRaw.includes('female') ? 'female' : 'male';
      const birthYear = parts[2] ? parts[2].replace(/\D/g, '') : '';
      const gen = parts[3] ? parseInt(parts[3], 10) || 3 : 3;
      const branch = parts[4] || 'Chi Trưởng';
      const occupation = parts[5] || '';
      const address = parts[6] || '';

      parsed.push({
        id: `row_parsed_${Date.now()}_${idx}`,
        full_name: fullName,
        gender,
        birth_year: birthYear,
        generation: gen,
        parent_id: '',
        branch,
        occupation,
        address,
      });
    });

    if (parsed.length > 0) {
      setTableRows((prev) => [...prev, ...parsed]);
      setAddMode('table');
      setAddFeedback({
        type: 'success',
        message: `Đã phân tích và đưa ${parsed.length} thành viên vào bảng. Bạn có thể kiểm tra lại rồi bấm Lưu.`,
      });
      setTimeout(() => setAddFeedback(null), 4000);
    }
  };

  // Submit bulk add
  const handleSaveBulkAdd = async () => {
    const validRows = tableRows.filter((r) => r.full_name.trim().length > 0);
    if (validRows.length === 0) {
      setAddFeedback({
        type: 'error',
        message: 'Vui lòng nhập họ và tên cho ít nhất một thành viên.',
      });
      return;
    }

    setAddLoading(true);
    setAddFeedback(null);

    try {
      const payload: Partial<Member>[] = validRows.map((r, i) => ({
        full_name: r.full_name.trim(),
        gender: r.gender,
        birth_year: r.birth_year ? parseInt(r.birth_year, 10) : null,
        generation: r.generation,
        parent_id: r.parent_id || null,
        branch: r.branch.trim() || null,
        occupation: r.occupation.trim() || null,
        address: r.address.trim() || null,
        birth_order: i + 1,
        is_alive: 1,
      }));

      const res = await api.bulkAddMembers(payload);
      if (res.success) {
        setAddFeedback({
          type: 'success',
          message: `Thành công: Đã thêm ${res.count} thành viên vào gia phả!`,
        });
        setTableRows([]);
        onRefreshData();
      } else {
        setAddFeedback({
          type: 'error',
          message: res.message || 'Lỗi khi thêm thành viên.',
        });
      }
    } catch (err: any) {
      setAddFeedback({
        type: 'error',
        message: err.message || 'Lỗi kết nối máy chủ.',
      });
    } finally {
      setAddLoading(false);
    }
  };

  // -------------------------------------------------------------
  // BULK DELETE ACTIONS
  // -------------------------------------------------------------
  const toggleSelectDelete = (id: string) => {
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    const allVisibleSelected = filteredDeleteMembers.every((m) => selectedDeleteIds.has(m.id));
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredDeleteMembers.forEach((m) => next.delete(m.id));
      } else {
        filteredDeleteMembers.forEach((m) => next.add(m.id));
      }
      return next;
    });
  };

  const handleSelectAllClan = () => {
    setSelectedDeleteIds(new Set(members.map((m) => m.id)));
  };

  const handleClearAllSelected = () => {
    setSelectedDeleteIds(new Set());
  };

  const handleConfirmDelete = async () => {
    if (selectedDeleteIds.size === 0) return;
    setDeleteLoading(true);
    setDeleteFeedback(null);

    try {
      const ids = Array.from(selectedDeleteIds) as string[];
      const res = await api.bulkDeleteMembers(ids, unlinkChildren);
      if (res.success) {
        setDeleteFeedback({
          type: 'success',
          message: `Đã xóa thành công ${res.count} thành viên khỏi gia phả!`,
        });
        setSelectedDeleteIds(new Set());
        setShowDeleteConfirm(false);
        onRefreshData();
      } else {
        setDeleteFeedback({
          type: 'error',
          message: res.message || 'Lỗi khi xóa thành viên.',
        });
      }
    } catch (err: any) {
      setDeleteFeedback({
        type: 'error',
        message: err.message || 'Lỗi khi gửi yêu cầu xóa.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RESET DEMO PHAM ACTION
  // -------------------------------------------------------------
  const handleResetDemoPham = async () => {
    if (!confirm('Hành động này sẽ xóa các thành viên hiện tại và khôi phục cây phả hệ mẫu 4 thế hệ chuẩn của Gia Tộc Họ Phạm (Thủy Tổ Phạm Văn Phúc). Bạn có chắc chắn?')) {
      return;
    }

    setResetLoading(true);
    setResetFeedback(null);
    try {
      const res = await api.resetClanDemoPham();
      if (res.success) {
        setResetFeedback('Đã thiết lập lại dữ liệu mẫu Gia Tộc Họ Phạm thành công! Dòng họ và cây phả hệ 4 đời đã sẵn sàng.');
        onRefreshData();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi đặt lại dữ liệu.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-1.5 p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab('add')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              subTab === 'add'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Hàng Loạt</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('delete')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              subTab === 'delete'
                ? 'bg-red-700 text-white shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa Hàng Loạt</span>
            {selectedDeleteIds.size > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] font-bold">
                {selectedDeleteIds.size}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('pham-demo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold transition-all ${
              subTab === 'pham-demo'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dữ Liệu Mẫu Họ Phạm</span>
          </button>
        </div>

        {/* Global Summary Badge */}
        <div className="text-xs text-stone-400 flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-800/80 border border-stone-700 rounded-lg">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Tổng số: <strong className="text-stone-200">{members.length}</strong> thành viên
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BULK ADD                                           */}
      {/* ========================================================= */}
      {subTab === 'add' && (
        <div className="flex-1 flex flex-col space-y-4">
          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium">Phương thức nhập:</span>
              <div className="inline-flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAddMode('table')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    addMode === 'table' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Bảng Nhập Liệu
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('text')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    addMode === 'text' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Dán Danh Sách Nhanh
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {addMode === 'table' && (
                <>
                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+1 Dòng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addMultipleRows(5)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>+5 Dòng</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {addFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                addFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/80 border-red-800 text-red-300'
              }`}
            >
              <span>{addFeedback.message}</span>
              <button
                type="button"
                onClick={() => setAddFeedback(null)}
                className="text-stone-400 hover:text-stone-200 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* MODE A: INTERACTIVE TABLE */}
          {addMode === 'table' && (
            <div className="flex-1 flex flex-col min-h-0 bg-stone-950/60 border border-stone-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto flex-1 max-h-[50vh]">
                <table className="w-full text-xs text-left border-collapse min-w-[900px]">
                  <thead className="bg-stone-950 text-stone-300 sticky top-0 z-10 border-b border-stone-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Họ và tên (*)</th>
                      <th className="py-2.5 px-3 w-24">Giới tính</th>
                      <th className="py-2.5 px-3 w-24">Năm sinh</th>
                      <th className="py-2.5 px-3 w-24">Đời thứ</th>
                      <th className="py-2.5 px-3 min-w-[170px]">Phụ thân (Cha)</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Chi nhánh</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Nghề nghiệp</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Nơi ở</th>
                      <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {tableRows.map((row, index) => (
                      <tr key={row.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="py-2 px-3 text-center text-stone-500 font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={row.full_name}
                            onChange={(e) => updateRow(row.id, 'full_name', e.target.value)}
                            placeholder="Ví dụ: Phạm Minh Khang"
                            className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={row.gender}
                            onChange={(e) => updateRow(row.id, 'gender', e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
                          >
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            value={row.birth_year}
                            onChange={(e) => updateRow(row.id, 'birth_year', e.target.value)}
                            placeholder="1990"
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs text-center font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={row.generation}
                            onChange={(e) => updateRow(row.id, 'generation', parseInt(e.target.value, 10))}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500 text-xs text-center font-mono font-bold text-amber-400"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                              <option key={g} value={g}>
                                Đời {g}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={row.parent_id}
                            onChange={(e) => updateRow(row.id, 'parent_id', e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-300 focus:outline-none focus:border-amber-500 text-xs truncate"
                          >
                            <option value="">-- Chưa chọn (Đời 1/Đầu chi) --</option>
                            {parentOptions.map((p) => (
                              <option key={p.id} value={p.id}>
                                Đời {p.generation}: {p.full_name} ({p.birth_year || '?'})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={row.branch}
                            onChange={(e) => updateRow(row.id, 'branch', e.target.value)}
                            placeholder="Chi Trưởng / Chi Hai..."
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={row.occupation}
                            onChange={(e) => updateRow(row.id, 'occupation', e.target.value)}
                            placeholder="Nghề nghiệp..."
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={row.address}
                            onChange={(e) => updateRow(row.id, 'address', e.target.value)}
                            placeholder="Nơi cư trú..."
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="p-1 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-400">
                  Tổng cộng: <strong className="text-amber-400">{tableRows.length}</strong> dòng cần nhập (có tên: {tableRows.filter(r => r.full_name.trim()).length})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTableRows([])}
                    className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    Xóa Hết Bảng
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBulkAdd}
                    disabled={addLoading || tableRows.filter(r => r.full_name.trim()).length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    {addLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Lưu...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu {tableRows.filter(r => r.full_name.trim()).length} Thành Viên Vào Gia Phả</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: QUICK TEXT PARSER */}
          {addMode === 'text' && (
            <div className="flex-1 flex flex-col space-y-3 bg-stone-950/70 border border-stone-800 p-4 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Dán Danh Sách Phân Tách Bằng Dấu Phẩy Hoặc Gạch Đứng (|)
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Cấu trúc mỗi dòng: <code>Họ và tên, Giới tính (Nam/Nữ), Năm sinh, Đời thứ (1-10), Chi họ, Nghề nghiệp, Nơi ở</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
`Phạm Văn Hưng, Nam, 1992, 3, Chi Hai, Kỹ sư phần mềm, Hà Nội
Phạm Thị Mai Phương, Nữ, 1995, 3, Chi Hai, Kế toán, Hải Dương
Phạm Hoàng Nam, Nam, 2020, 4, Chi Trưởng, Mầm non, Hà Nội`
                    );
                    setCopiedTemplate(true);
                    setTimeout(() => setCopiedTemplate(false), 2000);
                  }}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 px-2.5 py-1 bg-amber-950/50 border border-amber-800/60 rounded-lg shrink-0"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Đã Sao Chép Mẫu' : 'Sao Chép Mẫu'}</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán nội dung vào đây..."
                className="w-full p-3 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 font-mono text-xs focus:outline-none focus:border-amber-500 resize-none"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  Số dòng phát hiện: {rawText.split('\n').filter((l) => l.trim()).length} dòng
                </span>
                <button
                  type="button"
                  onClick={handleParseTextToRows}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                >
                  <span>Phân Tích & Đưa Vào Bảng Kiểm Tra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BULK DELETE                                        */}
      {/* ========================================================= */}
      {subTab === 'delete' && (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Top Filter & Batch Action Bar */}
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
            {/* Search & Filter */}
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deleteSearch}
                  onChange={(e) => setDeleteSearch(e.target.value)}
                  placeholder="Lọc tên, năm sinh, chi..."
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={deleteFilterGen}
                onChange={(e) => setDeleteFilterGen(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Tất cả thế hệ</option>
                {generations.map((g) => (
                  <option key={g} value={g}>
                    Đời {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Selection buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Chọn hiển thị ({filteredDeleteMembers.length})</span>
              </button>

              <button
                type="button"
                onClick={handleSelectAllClan}
                className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors"
              >
                Chọn Toàn Bộ ({members.length})
              </button>

              {selectedDeleteIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSelected}
                  className="px-2 py-1.5 text-stone-400 hover:text-stone-200 text-xs transition-colors"
                >
                  Bỏ Chọn
                </button>
              )}
            </div>
          </div>

          {/* Delete Action Bar & Options */}
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-red-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Đã chọn: <strong className="text-white text-sm underline">{selectedDeleteIds.size}</strong> thành viên
              </span>

              <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={unlinkChildren}
                  onChange={(e) => setUnlinkChildren(e.target.checked)}
                  className="rounded border-stone-700 text-amber-500 focus:ring-0"
                />
                <span>Tự động gỡ quan hệ cha/con nếu con vẫn giữ lại</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedDeleteIds.size === 0 || deleteLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-lg transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedDeleteIds.size} Thành Viên Đã Chọn</span>
            </button>
          </div>

          {/* Delete Feedback */}
          {deleteFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                deleteFeedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/80 border-red-800 text-red-300'
              }`}
            >
              <span>{deleteFeedback.message}</span>
              <button
                type="button"
                onClick={() => setDeleteFeedback(null)}
                className="text-stone-400 hover:text-stone-200 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Member Selection List */}
          <div className="flex-1 min-h-0 bg-stone-950/60 border border-stone-800 rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 max-h-[50vh] divide-y divide-stone-800/60">
              {filteredDeleteMembers.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">
                  Không tìm thấy thành viên phù hợp với bộ lọc.
                </div>
              ) : (
                filteredDeleteMembers.map((member) => {
                  const isSelected = selectedDeleteIds.has(member.id);
                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleSelectDelete(member.id)}
                      className={`px-3 py-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer select-none transition-colors ${
                        isSelected
                          ? 'bg-red-950/30 text-red-100 hover:bg-red-950/40'
                          : 'hover:bg-stone-900/60 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className="text-stone-400 hover:text-stone-200 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectDelete(member.id);
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-600" />
                          )}
                        </button>

                        <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center font-bold text-stone-300 shrink-0 border border-stone-700">
                          {member.full_name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-stone-100 truncate flex items-center gap-1.5">
                            <span>{member.full_name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">
                              Đời {member.generation}
                            </span>
                            {member.gender === 'female' ? (
                              <span className="text-[10px] text-pink-400">Nữ</span>
                            ) : (
                              <span className="text-[10px] text-blue-400">Nam</span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 truncate">
                            {member.birth_year ? `Sinh: ${member.birth_year}` : 'Chưa rõ năm sinh'}
                            {member.branch ? ` • ${member.branch}` : ''}
                            {member.occupation ? ` • ${member.occupation}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            member.is_alive === 1
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {member.is_alive === 1 ? 'Còn sống' : 'Đã mất'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: RESET TO PHAM CLAN DEMO                            */}
      {/* ========================================================= */}
      {subTab === 'pham-demo' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-950/60 border border-stone-800 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 text-3xl font-serif shadow-xl">
            范
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-amber-200">
              Khôi Phục & Chuẩn Hóa Dữ Liệu Mẫu Gia Tộc Họ Phạm
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Tính năng này sẽ đồng bộ toàn bộ tên gọi trong cây gia phả sang <strong className="text-amber-300">Gia Tộc Họ Phạm Đại Tôn</strong> với 4 thế hệ chuẩn mực từ Cụ Thủy Tổ <strong className="text-stone-200">Phạm Văn Phúc</strong>, Trưởng chi <strong className="text-stone-200">Phạm Văn Thành</strong>, và các thế hệ con cháu kế thừa.
            </p>
          </div>

          {resetFeedback && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 max-w-md">
              {resetFeedback}
            </div>
          )}

          <button
            type="button"
            onClick={handleResetDemoPham}
            disabled={resetLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {resetLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang Thiết Lập Lại...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Thiết Lập Lại Toàn Bộ Dữ Liệu Demo Họ Phạm (4 Đời Chuẩn)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Confirmation Modal for Bulk Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-stone-900 border border-red-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-stone-100">
            <div className="flex items-center gap-2.5 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/80 border border-red-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-200">Xác Nhận Xóa Hàng Loạt</h4>
                <p className="text-[11px] text-stone-400">Hành động này sẽ xóa vĩnh viễn khỏi cơ sở dữ liệu</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Bạn đang chuẩn bị xóa <strong className="text-red-400 font-bold text-sm">{selectedDeleteIds.size}</strong> thành viên khỏi gia phả.
              {unlinkChildren
                ? ' Các thành viên con của những người này sẽ được giữ lại và tự động chuyển về trạng thái không có phụ thân.'
                : ''}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang Xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác Nhận Xóa {selectedDeleteIds.size} Người</span>
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
