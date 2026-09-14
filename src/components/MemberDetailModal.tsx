import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Briefcase,
  MapPin,
  Heart,
  Users,
  Phone,
  BookOpen,
  Edit,
  Trash2,
  Plus,
  User as UserIcon,
  ChevronRight,
  Landmark,
} from 'lucide-react';
import { MemberDetail } from '../types.ts';
import { api } from '../services/api.ts';

interface MemberDetailModalProps {
  memberId: string | null;
  onClose: () => void;
  onSelectMember: (id: string) => void;
  onEditMember: (member: MemberDetail) => void;
  onAddChild: (parentId: string) => void;
  onDeleteMember: (id: string, name: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  memberId,
  onClose,
  onSelectMember,
  onEditMember,
  onAddChild,
  onDeleteMember,
  canEdit,
  isAdmin,
}) => {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) {
      setMember(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getMember(memberId)
      .then((data) => {
        if (isMounted) {
          setMember(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải chi tiết thành viên.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [memberId]);

  if (!memberId) return null;

  const defaultAvatar =
    member?.gender === 'female'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="member-detail-modal"
        className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-amber-200 uppercase tracking-wider">
              Thông Tin Thành Viên Gia Tộc
            </h2>
          </div>
          <button
            id="btn-close-detail"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-400">Đang tải thông tin thành viên...</p>
            </div>
          ) : error || !member ? (
            <div className="py-12 text-center text-rose-400 text-sm">
              {error || 'Không tìm thấy thông tin thành viên'}
            </div>
          ) : (
            <>
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-stone-950/70 p-4 rounded-xl border border-stone-800">
                <div className="relative shrink-0">
                  <img
                    src={member.avatar_url || defaultAvatar}
                    alt={member.full_name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-600/70 shadow-xl"
                  />
                  <span
                    className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      member.gender === 'female'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : 'bg-blue-950 text-blue-300 border-blue-700'
                    }`}
                  >
                    {member.gender === 'female' ? 'Nữ ♀' : 'Nam ♂'}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700/60">
                      Đời thứ {member.generation}
                    </span>
                    {member.branch && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700">
                        {member.branch}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                        member.is_alive === 1
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${member.is_alive === 1 ? 'bg-emerald-400' : 'bg-stone-500'}`}
                      />
                      {member.is_alive === 1 ? 'Còn sống' : 'Đã quy tiên'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-stone-100 mb-1">
                    {member.full_name}
                  </h3>

                  <p className="text-xs text-stone-400">
                    {member.birth_order ? `Con thứ ${member.birth_order}` : 'Thành viên gia tộc'}
                  </p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Ngày sinh */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-1">Ngày sinh / Năm sinh:</span>
                    <span className="font-semibold text-stone-200">
                      {member.birth_date || (member.birth_year ? `Năm ${member.birth_year}` : 'Chưa rõ')}
                    </span>
                  </div>
                </div>

                {/* Ngày mất (nếu có) */}
                {member.is_alive === 0 && (
                  <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-[11px] mb-1">Ngày mất:</span>
                      <span className="font-semibold text-stone-200">
                        {member.death_date || 'Chưa rõ ngày mất'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Nơi an táng */}
                {member.is_alive === 0 && member.burial_place && (
                  <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5 sm:col-span-2">
                    <Landmark className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-[11px] mb-1">Nơi an táng / Mộ phần:</span>
                      <span className="font-semibold text-stone-200">{member.burial_place}</span>
                    </div>
                  </div>
                )}

                {/* Nghề nghiệp */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                  <Briefcase className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-1">Nghề nghiệp / Công tác:</span>
                    <span className="font-semibold text-stone-200">{member.occupation || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {/* Nơi ở / Quê quán */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-1">Nơi ở hiện tại / Quê quán:</span>
                    <span className="font-semibold text-stone-200">{member.address || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {/* Vợ / Chồng (nhận diện theo giới tính) */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px] mb-1">
                      {member.gender === 'female' ? 'Chồng' : 'Vợ'}:
                    </span>
                    <span className="font-semibold text-stone-200">{member.spouse_name || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                {/* Số điện thoại */}
                {member.phone && (
                  <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/80 flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block text-[11px] mb-1">Số điện thoại:</span>
                      <a href={`tel:${member.phone}`} className="font-semibold text-amber-400 hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Tiểu sử & Công đức */}
              {member.bio && (
                <div className="p-4 rounded-xl bg-stone-950/50 border border-stone-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    Tiểu sử, Sự nghiệp & Công đức
                  </div>
                  <p className="text-xs text-stone-300 whitespace-pre-wrap leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Family Lineage Relations */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Quan Hệ Huyết Thống
                </h4>

                {/* Parent (Cha / Mẹ) */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    <div>
                      <span className="text-[11px] text-stone-400 block">Thế hệ tiền bối (Cha/Mẹ):</span>
                      {member.parent ? (
                        <button
                          onClick={() => onSelectMember(member.parent!.id)}
                          className="font-semibold text-amber-300 hover:underline text-xs flex items-center gap-1"
                        >
                          {member.parent.full_name} ({member.parent.birth_year || '?'})
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-stone-500">Cụ Thủy Tổ (Đời thứ 1)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Siblings (Anh chị em) */}
                {member.siblings && member.siblings.length > 0 && (
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                    <span className="text-[11px] text-stone-400 block">
                      Anh chị em ruột ({member.siblings.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {member.siblings.map((sib) => (
                        <button
                          key={sib.id}
                          onClick={() => onSelectMember(sib.id)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-950 hover:text-amber-300 border border-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
                        >
                          {sib.full_name} ({sib.birth_year || '?'})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children (Hậu duệ / Con cái) */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 block">
                      Hậu duệ / Các con ({member.children ? member.children.length : 0}):
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => onAddChild(member.id)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Thêm con
                      </button>
                    )}
                  </div>

                  {member.children && member.children.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {member.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => onSelectMember(child.id)}
                          className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 text-left flex items-center gap-2.5 transition-colors"
                        >
                          <img
                            src={child.avatar_url || (child.gender === 'female'
                              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80')}
                            alt={child.full_name}
                            className="w-8 h-8 rounded-full object-cover border border-stone-600 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold text-stone-100 block truncate">
                              {child.full_name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {child.birth_order ? `Con thứ ${child.birth_order} • ` : ''}
                              {child.birth_year ? `Năm ${child.birth_year}` : 'Chưa rõ năm'}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">Chưa có thông tin con cái</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions (Edit, Delete, Add Child) */}
        {member && (
          <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between gap-2 shrink-0">
            {isAdmin ? (
              <button
                id="btn-delete-member"
                onClick={() => onDeleteMember(member.id, member.full_name)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/60 border border-rose-900/50 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <button
                    id="btn-add-child-from-detail"
                    onClick={() => onAddChild(member.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Thêm con</span>
                  </button>

                  <button
                    id="btn-edit-member"
                    onClick={() => onEditMember(member)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
