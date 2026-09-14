import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, Check, User, Heart, Lock, Users, AlertCircle, Info } from 'lucide-react';
import { Member } from '../types.ts';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void>;
  initialData?: Partial<Member> | null;
  existingMembers: Member[];
  prefilledParentId?: string | null;
}

const PRESET_AVATARS = [
  { label: 'Cụ Ông cao niên', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', gender: 'male' },
  { label: 'Cụ Bà cao niên', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', gender: 'female' },
  { label: 'Nam trung niên', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', gender: 'male' },
  { label: 'Nữ trung niên', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', gender: 'female' },
  { label: 'Nam thanh niên', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', gender: 'male' },
  { label: 'Nữ thanh niên', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', gender: 'female' },
  { label: 'Bé trai', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80', gender: 'male' },
  { label: 'Bé gái', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', gender: 'female' },
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingMembers,
  prefilledParentId,
}) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isAlive, setIsAlive] = useState(1);
  const [deathDate, setDeathDate] = useState('');
  const [burialPlace, setBurialPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [generation, setGeneration] = useState(1);
  const [parentId, setParentId] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [birthOrder, setBirthOrder] = useState(1);
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Existing generations across the entire clan
  const existingGenerations = useMemo<number[]>(() => {
    const rawGens = existingMembers
      .map((m) => Number(m.generation))
      .filter((g): g is number => !isNaN(g) && g > 0);
    const uniqueGens = Array.from(new Set<number>(rawGens)).sort((a: number, b: number) => a - b);
    return uniqueGens;
  }, [existingMembers]);

  const maxExistingGen = useMemo(() => {
    return existingGenerations.length > 0 ? Math.max(...existingGenerations) : 0;
  }, [existingGenerations]);

  // Allowed generations when NO parent is selected (e.g. founding ancestors / root members)
  // Must NOT skip generations (cannot jump to gen 6 if gen 5 does not exist yet)
  const allowedGenerationsNoParent = useMemo(() => {
    if (existingMembers.length === 0) return [1];
    const list: number[] = [];
    // Can choose any existing generation, or immediate next generation (maxExistingGen + 1)
    for (let i = 1; i <= maxExistingGen + 1; i++) {
      if (i === 1 || existingGenerations.includes(i - 1)) {
        list.push(i);
      }
    }
    // If editing and already has a generation, keep it in list
    if (initialData?.generation && !list.includes(initialData.generation)) {
      list.push(initialData.generation);
      list.sort((a, b) => a - b);
    }
    return list;
  }, [existingMembers, existingGenerations, maxExistingGen, initialData]);

  // Selected parent info
  const selectedParent = useMemo(() => {
    if (!parentId) return null;
    return existingMembers.find((m) => m.id === parentId) || null;
  }, [parentId, existingMembers]);

  // Existing siblings (children of the selected parent, excluding current member being edited)
  const existingSiblings = useMemo(() => {
    if (!parentId) return [];
    return existingMembers
      .filter((m) => m.parent_id === parentId && (!initialData || m.id !== initialData.id))
      .sort((a, b) => (a.birth_order || 99) - (b.birth_order || 99));
  }, [parentId, existingMembers, initialData]);

  // Map of taken birth orders: birth_order -> member
  const takenBirthOrders = useMemo(() => {
    const map = new Map<number, Member>();
    existingSiblings.forEach((child) => {
      if (child.birth_order) {
        map.set(child.birth_order, child);
      }
    });
    return map;
  }, [existingSiblings]);

  // Helper to find the lowest available (unused) birth order
  const getNextAvailableOrder = (takenMap: Map<number, Member>, preferred?: number | null) => {
    if (preferred && preferred > 0 && !takenMap.has(preferred)) {
      return preferred;
    }
    let next = 1;
    while (takenMap.has(next)) {
      next++;
    }
    return next;
  };

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setGender(initialData.gender || 'male');
      setBirthDate(initialData.birth_date || '');
      setBirthYear(initialData.birth_year ? String(initialData.birth_year) : '');
      setIsAlive(initialData.is_alive !== undefined ? initialData.is_alive : 1);
      setDeathDate(initialData.death_date || '');
      setBurialPlace(initialData.burial_place || '');
      setOccupation(initialData.occupation || '');
      setAddress(initialData.address || '');
      setAvatarUrl(initialData.avatar_url || '');
      setParentId(initialData.parent_id || '');
      setSpouseName(initialData.spouse_name || '');
      setBranch(initialData.branch || '');
      setPhone(initialData.phone || '');
      setBio(initialData.bio || '');

      // Set generation: if parent exists, strictly lock to parent.generation + 1
      if (initialData.parent_id) {
        const p = existingMembers.find((m) => m.id === initialData.parent_id);
        if (p) {
          setGeneration(p.generation + 1);
        } else {
          setGeneration(initialData.generation || 1);
        }
      } else {
        setGeneration(initialData.generation || 1);
      }

      setBirthOrder(initialData.birth_order || 1);
    } else {
      // Reset form for adding new member
      setFullName('');
      setGender('male');
      setBirthDate('');
      setBirthYear('');
      setIsAlive(1);
      setDeathDate('');
      setBurialPlace('');
      setOccupation('');
      setAddress('');
      setAvatarUrl('');
      setSpouseName('');
      setBranch('');
      setPhone('');
      setBio('');

      const targetParentId = prefilledParentId || '';
      setParentId(targetParentId);

      if (targetParentId) {
        const parent = existingMembers.find((m) => m.id === targetParentId);
        if (parent) {
          setGeneration(parent.generation + 1);
          if (parent.branch) setBranch(parent.branch);
        }
        // Auto-select lowest available birth order for this parent
        const siblings = existingMembers.filter((m) => m.parent_id === targetParentId);
        const taken = new Map<number, Member>();
        siblings.forEach((s) => {
          if (s.birth_order) taken.set(s.birth_order, s);
        });
        setBirthOrder(getNextAvailableOrder(taken, 1));
      } else {
        setGeneration(1);
        setBirthOrder(1);
      }
    }
    setError(null);
  }, [initialData, prefilledParentId, existingMembers, isOpen]);

  // Handle parent change to auto-calculate generation, branch, and next available birth order
  const handleParentChange = (newParentId: string) => {
    setParentId(newParentId);
    setError(null);

    if (newParentId) {
      const parent = existingMembers.find((m) => m.id === newParentId);
      if (parent) {
        setGeneration(parent.generation + 1);
        if (!branch && parent.branch) {
          setBranch(parent.branch);
        }
      }

      // Automatically find next available birth order for this parent
      const siblings = existingMembers.filter(
        (m) => m.parent_id === newParentId && (!initialData || m.id !== initialData.id)
      );
      const taken = new Map<number, Member>();
      siblings.forEach((s) => {
        if (s.birth_order) taken.set(s.birth_order, s);
      });
      const nextOrder = getNextAvailableOrder(taken, initialData?.birth_order);
      setBirthOrder(nextOrder);
    } else {
      // Unset parent: ensure generation does not jump into a gap
      if (!allowedGenerationsNoParent.includes(generation)) {
        setGeneration(allowedGenerationsNoParent[0] || 1);
      }
    }
  };

  // Image file upload to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có kích thước dưới 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên.');
      return;
    }

    // Validation 1: Birth order must not duplicate among siblings of the same parent
    if (parentId && takenBirthOrders.has(birthOrder)) {
      const conflictChild = takenBirthOrders.get(birthOrder);
      setError(
        `Trùng thứ tự con: Cha/Mẹ (${selectedParent?.full_name || 'đã chọn'}) đã có con thứ ${birthOrder} (${conflictChild?.full_name || 'Đã tồn tại'}). Vui lòng chọn thứ tự con khác chưa có!`
      );
      return;
    }

    // Validation 2: Generation cannot skip
    let finalGen = Number(generation) || 1;
    if (parentId) {
      if (selectedParent) {
        finalGen = selectedParent.generation + 1;
      }
    } else {
      // For members without parent: check if previous generation exists
      if (finalGen > 1 && !existingGenerations.includes(finalGen - 1)) {
        setError(
          `Không thể chọn Đời thứ ${finalGen} khi Đời thứ ${finalGen - 1} chưa có thành viên nào trong gia phả. Các thế hệ phải liên tục, không được nhảy cóc thế hệ.`
        );
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const payload: Partial<Member> = {
        full_name: fullName.trim(),
        gender,
        birth_date: birthDate.trim() || null,
        birth_year: birthYear ? parseInt(birthYear, 10) : null,
        is_alive: isAlive,
        death_date: isAlive === 0 && deathDate.trim() ? deathDate.trim() : null,
        burial_place: isAlive === 0 && burialPlace.trim() ? burialPlace.trim() : null,
        occupation: occupation.trim() || null,
        address: address.trim() || null,
        avatar_url: avatarUrl || null,
        generation: finalGen,
        parent_id: parentId || null,
        spouse_name: spouseName.trim() || null,
        birth_order: Number(birthOrder) || 1,
        branch: branch.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin thành viên.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="member-form-modal"
        className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/60 shrink-0">
          <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wide">
            {initialData ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Thành Viên Mới Vào Gia Phả'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Section 1: Avatar Selection */}
          <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800 space-y-3">
            <label className="block text-xs font-semibold text-amber-300">
              Ảnh đại diện (Avatar)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={
                    avatarUrl ||
                    (gender === 'female'
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
                  }
                  alt="Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-600 shadow-md"
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg border border-stone-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1.5">Hoặc chọn ảnh mẫu:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 transition-transform hover:scale-110 ${
                          avatarUrl === av.url ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-stone-700 opacity-70 hover:opacity-100'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Họ và Tên <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-member-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Phúc"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Giới tính</label>
              <select
                id="input-member-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="male">Nam ♂</option>
                <option value="female">Nữ ♀</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Trạng thái còn sống / đã mất */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Tình trạng</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAlive(1)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    isAlive === 1
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  Còn sống
                </button>
                <button
                  type="button"
                  onClick={() => setIsAlive(0)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    isAlive === 0
                      ? 'bg-stone-800 text-stone-200 border-stone-600'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  Đã quy tiên
                </button>
              </div>
            </div>

            {/* Năm sinh */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Năm sinh (Số)
              </label>
              <input
                id="input-member-birth-year"
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="Ví dụ: 1980"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Ngày tháng năm sinh chi tiết */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Ngày sinh chi tiết (hoặc Âm lịch)
              </label>
              <input
                id="input-member-birth-date"
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Ví dụ: 15/03/1980 hoặc Ngày 10 tháng 2 AL"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Thông tin khi đã mất */}
            {isAlive === 0 && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Ngày mất (Hưởng thọ / Ngày giỗ)
                  </label>
                  <input
                    id="input-member-death-date"
                    type="text"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    placeholder="Ví dụ: 20/10/2020 hoặc Ngày 12 tháng 9 AL"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nơi an táng / Mộ phần
                  </label>
                  <input
                    id="input-member-burial-place"
                    type="text"
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    placeholder="Ví dụ: Nghĩa trang dòng họ, Đông Ngạc"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            {/* Nghề nghiệp */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Nghề nghiệp / Chức vụ</label>
              <input
                id="input-member-occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Ví dụ: Kỹ sư xây dựng, Giáo viên..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Nơi ở / Quê quán */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Nơi ở / Quê quán</label>
              <input
                id="input-member-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: Cầu Giấy, Hà Nội"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Vợ / Chồng (nhận diện theo giới tính) */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                {gender === 'female' ? 'Chồng' : 'Vợ'} (Hôn phối)
              </label>
              <input
                id="input-member-spouse"
                type="text"
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                placeholder={
                  gender === 'female'
                    ? 'Ví dụ: Họ và tên người chồng (năm sinh)...'
                    : 'Ví dụ: Lê Thị Mai (1982)...'
                }
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Số điện thoại liên lạc</label>
              <input
                id="input-member-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Quan hệ phả hệ */}
          <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                Quan Hệ Phả Hệ & Thứ Bậc
              </h3>
              {parentId && selectedParent && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium">
                  Đang gắn với: {selectedParent.full_name} (Đời {selectedParent.generation})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cha / Mẹ */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center justify-between">
                  <span>Cha / Mẹ trực hệ trong dòng họ</span>
                  {parentId && (
                    <button
                      type="button"
                      onClick={() => handleParentChange('')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Bỏ chọn cha/mẹ
                    </button>
                  )}
                </label>
                <select
                  id="select-member-parent"
                  value={parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Không có (Cụ Thủy Tổ / Tiền Bối Khởi Đầu) --</option>
                  {existingMembers
                    .filter((m) => !initialData || m.id !== initialData.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        [Đời {m.generation}] {m.full_name} ({m.birth_year || '?'}) {m.branch ? `- ${m.branch}` : ''}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Chọn cha hoặc mẹ để tự động tính thế hệ và xếp thứ tự con tránh trùng lặp.
                </p>
              </div>

              {/* Thế hệ (Đời thứ) */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center justify-between">
                  <span>Đời thứ mấy</span>
                  {parentId && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-normal">
                      <Lock className="w-2.5 h-2.5" /> Khóa tự động
                    </span>
                  )}
                </label>

                {parentId && selectedParent ? (
                  // Locked generation when parent is selected
                  <div>
                    <div className="w-full px-3 py-2 bg-stone-900/90 border border-amber-800/40 rounded-lg text-sm text-amber-300 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        Đời thứ {generation}
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        (Đời {selectedParent.generation} + 1)
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Tự động tính theo Cha/Mẹ ({selectedParent.full_name}). Không nhảy cóc đời.
                    </p>
                  </div>
                ) : (
                  // Select generation strictly sequential when no parent is selected
                  <div>
                    <select
                      id="select-member-generation"
                      value={generation}
                      onChange={(e) => setGeneration(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    >
                      {allowedGenerationsNoParent.map((g) => (
                        <option key={g} value={g}>
                          Đời thứ {g} {g === 1 ? '(Thủy Tổ)' : g === maxExistingGen + 1 ? `(Thế hệ mới tiếp nối Đời ${maxExistingGen})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {maxExistingGen > 0
                        ? `Gia phả có Đời 1 - ${maxExistingGen}. Tối đa tạo Đời ${maxExistingGen + 1}.`
                        : 'Bắt đầu từ Đời 1.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Thứ tự con trong nhà */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1 flex items-center justify-between">
                  <span>Thứ tự con trong nhà</span>
                  {parentId && takenBirthOrders.size > 0 && (
                    <span className="text-[10px] text-emerald-400 font-normal">
                      Tự động chọn số kế tiếp
                    </span>
                  )}
                </label>
                <select
                  id="select-member-birth-order"
                  value={birthOrder}
                  onChange={(e) => setBirthOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  {Array.from(
                    {
                      length: Math.max(
                        12,
                        birthOrder + 2,
                        ...Array.from(takenBirthOrders.keys()).map((k) => Number(k))
                      ),
                    },
                    (_, idx) => {
                      const order = idx + 1;
                      const isTaken = takenBirthOrders.has(order);
                      const existingChild = takenBirthOrders.get(order);
                      return (
                        <option
                          key={order}
                          value={order}
                          disabled={isTaken}
                          className={isTaken ? 'text-stone-500 bg-stone-900 line-through' : ''}
                        >
                          {order === 1 ? 'Con Trưởng (Con thứ 1)' : `Con thứ ${order}`}
                          {isTaken ? ` (ĐÃ CÓ: ${existingChild?.full_name}) - Khóa` : ''}
                        </option>
                      );
                    }
                  )}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  {parentId
                    ? 'Các số thứ tự đã có của người cha/mẹ này được khóa để không trùng lặp.'
                    : 'Thứ tự con trong gia đình.'}
                </p>
              </div>

              {/* Chi / Nhánh */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-300 mb-1">Chi / Nhánh họ</label>
                <input
                  id="input-member-branch"
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Ví dụ: Chi Trưởng, Chi Hai, Nhánh Đông Ngạc..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Tự động kế thừa theo nhánh của cha/mẹ (có thể điều chỉnh nếu cần).
                </p>
              </div>

              {/* Sibling status callout if parent is selected */}
              {parentId && selectedParent && (
                <div className="sm:col-span-3 p-3 bg-stone-900/70 rounded-lg border border-stone-800 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Các con hiện có của {selectedParent.full_name} ({existingSiblings.length} người):
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Cha/Mẹ: <strong className="text-stone-200">Đời {selectedParent.generation}</strong> → Con: <strong className="text-amber-400">Đời {selectedParent.generation + 1}</strong>
                    </span>
                  </div>

                  {existingSiblings.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {existingSiblings.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-950 border border-stone-700 text-[11px] text-stone-200"
                        >
                          <span className="text-amber-400 font-semibold">Con thứ {s.birth_order || '?'}:</span>
                          <span>{s.full_name}</span>
                          {s.birth_year ? <span className="text-stone-400 text-[10px]">({s.birth_year})</span> : null}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-400">
                      Người này chưa có người con nào trong hệ thống. Đang tạo người con đầu tiên (Con thứ 1).
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium pt-0.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Hệ thống tự động chọn số thứ tự chưa có tiếp theo: <strong>Con thứ {birthOrder}</strong>. Các số thứ tự trùng đã bị vô hiệu hóa.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Tiểu sử / Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Tiểu sử, Công đức & Sự nghiệp
            </label>
            <textarea
              id="input-member-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ghi chú về học vấn, công lao đóng góp cho dòng họ và xã hội..."
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              id="btn-submit-member"
              className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Đang lưu...' : initialData ? 'Lưu Thay Đổi' : 'Thêm Vào Gia Phả'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
