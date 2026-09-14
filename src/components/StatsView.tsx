import React, { useMemo } from 'react';
import {
  Users,
  Layers,
  Heart,
  Landmark,
  Calendar,
  MapPin,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { ClanInfo, ClanStats, Member } from '../types.ts';

interface StatsViewProps {
  clan: ClanInfo | null;
  stats: ClanStats | null;
  members: Member[];
}

export const StatsView: React.FC<StatsViewProps> = ({ clan, stats, members }) => {
  // Breakdown by generation
  const genCounts = useMemo(() => {
    const map: Record<number, { count: number; alive: number; deceased: number }> = {};
    members.forEach((m) => {
      const g = m.generation || 1;
      if (!map[g]) map[g] = { count: 0, alive: 0, deceased: 0 };
      map[g].count += 1;
      if (m.is_alive === 1) map[g].alive += 1;
      else map[g].deceased += 1;
    });
    return Object.entries(map)
      .map(([gen, data]) => ({
        generation: Number(gen),
        ...data,
      }))
      .sort((a, b) => a.generation - b.generation);
  }, [members]);

  // Breakdown by Branch
  const branchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    members.forEach((m) => {
      const b = m.branch || 'Chưa phân chi';
      map[b] = (map[b] || 0) + 1;
    });
    return Object.entries(map)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  const maxGenCount = Math.max(...genCounts.map((g) => g.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 lg:pb-12 text-stone-100">
      {/* Clan Heritage Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-amber-800/40 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 font-mono">
              BẢN SẮC & TRUYỀN THỐNG DÒNG TỘC
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-amber-100">
              {clan?.name || 'Gia Phả Đại Tộc'}
            </h2>
            {clan?.ancestor_name && (
              <p className="text-xs sm:text-sm text-stone-300">
                Thủy Tổ Tiên Linh: <strong className="text-amber-300">{clan.ancestor_name}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <span className="block text-[10px] text-stone-400 uppercase tracking-wider">Tổng Thế Hệ</span>
              <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
                {stats?.totalGenerations || 1}
              </span>
            </div>
            <div className="px-3.5 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-center">
              <span className="block text-[10px] text-stone-400 uppercase tracking-wider">Tổng Số Đinh</span>
              <span className="text-lg sm:text-xl font-bold text-amber-400 font-mono">
                {members.length}
              </span>
            </div>
          </div>
        </div>

        {/* Clan Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          {clan?.origin && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-400 block text-[11px]">Quê quán gốc:</span>
                <span className="font-semibold text-stone-200">{clan.origin}</span>
              </div>
            </div>
          )}

          {clan?.temple_address && (
            <div className="flex items-start gap-2.5">
              <Landmark className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-400 block text-[11px]">Từ đường / Nhà thờ họ:</span>
                <span className="font-semibold text-stone-200">{clan.temple_address}</span>
              </div>
            </div>
          )}

          {clan?.anniversary_lunar && (
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-400 block text-[11px]">Ngày giỗ tổ (Âm lịch):</span>
                <span className="font-semibold text-amber-300">{clan.anniversary_lunar}</span>
              </div>
            </div>
          )}
        </div>

        {clan?.description && (
          <div className="mt-4 pt-3 border-t border-stone-800 text-xs text-stone-300 italic leading-relaxed">
            "{clan.description}"
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Members */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Tổng thành viên</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-100 font-mono">{members.length}</div>
          <div className="text-[11px] text-stone-400 mt-1">Đã được ghi chép trong gia phả</div>
        </div>

        {/* Alive Members */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Còn sống</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {stats?.aliveMembers || 0}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Chiếm{' '}
            {members.length > 0
              ? Math.round(((stats?.aliveMembers || 0) / members.length) * 100)
              : 0}
            % tổng nhân khẩu
          </div>
        </div>

        {/* Deceased Members */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Đã quy tiên</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-300 font-mono">
            {stats?.deceasedMembers || 0}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Tiên tổ & người quá cố</div>
        </div>

        {/* Gender Ratio */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Giới tính (Nam / Nữ)</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-stone-100 font-mono">
            <span className="text-blue-400">{stats?.maleMembers || 0}</span> /{' '}
            <span className="text-rose-400">{stats?.femaleMembers || 0}</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Nam: {stats?.maleMembers || 0} • Nữ: {stats?.femaleMembers || 0}
          </div>
        </div>
      </div>

      {/* Generations Distribution Chart */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" /> Phân Bố Thành Viên Theo Thế Hệ
          </h3>
          <span className="text-xs text-stone-400">Từ Thủy Tổ đến nay</span>
        </div>

        <div className="space-y-3 pt-2">
          {genCounts.map((g) => {
            const pct = Math.round((g.count / maxGenCount) * 100);
            return (
              <div key={g.generation} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">
                    Thế hệ thứ {g.generation} (Đời {g.generation})
                  </span>
                  <span className="font-mono text-stone-400">
                    <strong className="text-amber-400">{g.count}</strong> thành viên (
                    <span className="text-emerald-400">{g.alive} còn sống</span>,{' '}
                    <span className="text-stone-400">{g.deceased} đã mất</span>)
                  </span>
                </div>
                <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden flex border border-stone-800">
                  <div
                    style={{ width: `${pct}%` }}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Branch Distribution */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Phân Bố Theo Chi Nhánh Dòng Họ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {branchCounts.map((b) => (
            <div
              key={b.branch}
              className="p-3.5 bg-stone-950/60 rounded-xl border border-stone-800 flex items-center justify-between"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-stone-200 truncate">{b.branch}</h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Tỷ lệ: {Math.round((b.count / (members.length || 1)) * 100)}%
                </p>
              </div>
              <span className="text-base font-bold text-amber-400 font-mono px-2 py-0.5 bg-amber-950/80 rounded border border-amber-800/60">
                {b.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
