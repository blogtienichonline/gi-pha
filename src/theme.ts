import { ClanInfo } from './types.ts';

export type ThemeColorKey = 'amber' | 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'bronze';
export type BgStyleKey = 'dark' | 'warm-dark' | 'wood' | 'light';
export type PatternStyleKey = 'dongson' | 'lotus' | 'minimal' | 'none';
export type LogoShapeKey = 'rounded-xl' | 'rounded-full' | 'rounded-3xl' | 'rounded-none';

export interface ThemeColorDefinition {
  id: ThemeColorKey;
  name: string;
  desc: string;
  description?: string;
  hex: string;
  accentHex: string;
  lightHex: string;
  borderHex: string;
  gradient: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  primaryBtn: string;
  secondaryBtn: string;
  textAccent: string;
  textTitle: string;
  borderAccent: string;
  ringAccent: string;
}

export interface BgStyleDefinition {
  id: BgStyleKey;
  name: string;
  desc: string;
  description?: string;
  bodyClass: string;
  headerClass: string;
  cardClass: string;
  innerCardClass: string;
  textPrimary: string;
  textMuted: string;
  borderClass: string;
  isDark: boolean;
}

export const THEME_COLORS: Record<ThemeColorKey, ThemeColorDefinition> = {
  amber: {
    id: 'amber',
    name: 'Hoàng Kim (Vàng Đồng)',
    desc: 'Sắc vàng hoàng gia cổ truyền, biểu trưng cho phúc lộc và vương giả thịnh vượng',
    hex: '#d97706',
    accentHex: '#f59e0b',
    lightHex: '#fef3c7',
    borderHex: '#78350f',
    gradient: 'from-amber-600 via-amber-700 to-amber-900',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-800/60',
    primaryBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30',
    secondaryBtn: 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60',
    textAccent: 'text-amber-400',
    textTitle: 'text-amber-200',
    borderAccent: 'border-amber-600',
    ringAccent: 'ring-amber-500',
  },
  ruby: {
    id: 'ruby',
    name: 'Chu Sa (Đỏ Huyết Ngọc)',
    desc: 'Sắc đỏ son uy linh truyền thống, biểu trưng may mắn và huyết thống bền chặt',
    hex: '#dc2626',
    accentHex: '#ef4444',
    lightHex: '#fee2e2',
    borderHex: '#7f1d1d',
    gradient: 'from-red-600 via-red-700 to-red-950',
    badgeBg: 'bg-red-950/80',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-800/60',
    primaryBtn: 'bg-red-700 hover:bg-red-600 text-white shadow-red-900/30',
    secondaryBtn: 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60',
    textAccent: 'text-red-400',
    textTitle: 'text-red-200',
    borderAccent: 'border-red-600',
    ringAccent: 'ring-red-500',
  },
  emerald: {
    id: 'emerald',
    name: 'Bích Ngọc (Xanh Ngọc Lục)',
    desc: 'Sắc ngọc bích thanh tao, biểu trưng cho sự trường tồn và phúc đức sinh sôi nảy nở',
    hex: '#059669',
    accentHex: '#10b981',
    lightHex: '#d1fae5',
    borderHex: '#064e3b',
    gradient: 'from-emerald-600 via-emerald-700 to-emerald-950',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-800/60',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30',
    secondaryBtn: 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60',
    textAccent: 'text-emerald-400',
    textTitle: 'text-emerald-200',
    borderAccent: 'border-emerald-600',
    ringAccent: 'ring-emerald-500',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Lam Ngọc (Xanh Dương Cổ)',
    desc: 'Sắc xanh biếc vững chãi, biểu trưng cho tri thức, chính trực và uy nghiêm',
    hex: '#2563eb',
    accentHex: '#3b82f6',
    lightHex: '#dbeafe',
    borderHex: '#1e3a8a',
    gradient: 'from-blue-600 via-blue-700 to-blue-950',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-800/60',
    primaryBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30',
    secondaryBtn: 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60',
    textAccent: 'text-blue-400',
    textTitle: 'text-blue-200',
    borderAccent: 'border-blue-600',
    ringAccent: 'ring-blue-500',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Tử Kim (Tím Hoàng Tộc)',
    desc: 'Sắc tím thạch anh quyền quý, tượng trưng cho danh gia vọng tộc và truyền thống nho phong',
    hex: '#7c3aed',
    accentHex: '#8b5cf6',
    lightHex: '#ede9fe',
    borderHex: '#4c1d95',
    gradient: 'from-purple-600 via-purple-700 to-purple-950',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-800/60',
    primaryBtn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30',
    secondaryBtn: 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60',
    textAccent: 'text-purple-400',
    textTitle: 'text-purple-200',
    borderAccent: 'border-purple-600',
    ringAccent: 'ring-purple-500',
  },
  bronze: {
    id: 'bronze',
    name: 'Đồng Cổ (Nâu Trầm Hương)',
    desc: 'Sắc nâu ấm của chuông đồng cổ và cột gỗ lim từ đường cổ kính, trầm mặc nghìn năm',
    hex: '#b45309',
    accentHex: '#d97706',
    lightHex: '#fef3c7',
    borderHex: '#451a03',
    gradient: 'from-amber-700 via-stone-800 to-stone-950',
    badgeBg: 'bg-stone-900/90',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-900/60',
    primaryBtn: 'bg-amber-700 hover:bg-amber-600 text-white shadow-stone-900/40',
    secondaryBtn: 'bg-stone-900/80 hover:bg-stone-800 text-amber-200 border border-amber-900/60',
    textAccent: 'text-amber-400',
    textTitle: 'text-amber-200',
    borderAccent: 'border-amber-700',
    ringAccent: 'ring-amber-600',
  },
};

export const BG_STYLES: Record<BgStyleKey, BgStyleDefinition> = {
  dark: {
    id: 'dark',
    name: 'Đêm Cổ Kính (Tối Hoàng Gia)',
    desc: 'Nền đá đen huyền bí, tương phản cao, tối ưu hiển thị',
    bodyClass: 'bg-stone-950 text-stone-100',
    headerClass: 'bg-stone-950/95 border-stone-800 backdrop-blur-md',
    cardClass: 'bg-stone-900/90 border-stone-800 text-stone-100',
    innerCardClass: 'bg-stone-950/70 border-stone-800/80',
    textPrimary: 'text-stone-100',
    textMuted: 'text-stone-400',
    borderClass: 'border-stone-800',
    isDark: true,
  },
  'warm-dark': {
    id: 'warm-dark',
    name: 'Trầm Mặc Từ Đường (Nâu Gỗ Tối)',
    desc: 'Không gian gỗ trầm ấm cúng, đậm chất từ đường truyền thống',
    bodyClass: 'bg-[#120d0a] text-amber-50',
    headerClass: 'bg-[#120d0a]/95 border-amber-950/80 backdrop-blur-md',
    cardClass: 'bg-[#1c1511]/95 border-amber-900/40 text-amber-50',
    innerCardClass: 'bg-[#0f0b08]/80 border-amber-950/80',
    textPrimary: 'text-amber-50',
    textMuted: 'text-amber-200/60',
    borderClass: 'border-amber-900/40',
    isDark: true,
  },
  wood: {
    id: 'wood',
    name: 'Trầm Mặc Từ Đường (Nâu Gỗ Tối)',
    desc: 'Không gian gỗ trầm ấm cúng, đậm chất từ đường truyền thống',
    bodyClass: 'bg-[#120d0a] text-amber-50',
    headerClass: 'bg-[#120d0a]/95 border-amber-950/80 backdrop-blur-md',
    cardClass: 'bg-[#1c1511]/95 border-amber-900/40 text-amber-50',
    innerCardClass: 'bg-[#0f0b08]/80 border-amber-950/80',
    textPrimary: 'text-amber-50',
    textMuted: 'text-amber-200/60',
    borderClass: 'border-amber-900/40',
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Bình Minh Gia Tộc (Sáng Trang Nhã)',
    desc: 'Màu giấy dó cổ điển ngà sáng, chữ nét thanh thoát, trang nhã thanh lịch',
    bodyClass: 'bg-[#faf6f0] text-stone-900',
    headerClass: 'bg-[#faf6f0]/95 border-stone-200 shadow-sm backdrop-blur-md',
    cardClass: 'bg-white/95 border-stone-200/90 shadow-sm text-stone-900',
    innerCardClass: 'bg-[#f4efe4] border-stone-200',
    textPrimary: 'text-stone-900',
    textMuted: 'text-stone-500',
    borderClass: 'border-stone-200',
    isDark: false,
  },
};

export const PATTERN_STYLES: Record<PatternStyleKey, { id: PatternStyleKey; name: string; description: string }> = {
  dongson: {
    id: 'dongson',
    name: 'Trống Đồng Đông Sơn',
    description: 'Biểu tượng chim Lạc và mặt trời thiêng',
  },
  lotus: {
    id: 'lotus',
    name: 'Hoa Sen Cổ Truyền',
    description: 'Thanh tịnh, cao quý và trường thọ',
  },
  minimal: {
    id: 'minimal',
    name: 'Lưới Điểm Tinh Giản',
    description: 'Hiện đại, trang nhã và thanh lịch',
  },
  none: {
    id: 'none',
    name: 'Trơn Không Họa Tiết',
    description: 'Nền đồng nhất tối giản',
  },
};

export const COMMON_CLAN_CHARACTERS = [
  '氏', 'Phúc', 'Đức', 'Thọ', 'Tổ',
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng',
  'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ',
];

export const LOGO_SHAPES: { key: LogoShapeKey; name: string; class: string }[] = [
  { key: 'rounded-xl', name: 'Vuông Bo Góc', class: 'rounded-xl' },
  { key: 'rounded-full', name: 'Hình Tròn', class: 'rounded-full' },
  { key: 'rounded-3xl', name: 'Khiên Gia Huy', class: 'rounded-3xl' },
  { key: 'rounded-none', name: 'Góc Cổ Điển', class: 'rounded-none' },
];

export const LOGO_PRESETS = [
  { label: 'Chữ Thị (氏) - Dòng họ', value: '氏' },
  { label: 'Chữ Phúc (福) - May mắn', value: '福' },
  { label: 'Chữ Đức (德) - Đạo đức', value: '德' },
  { label: 'Chữ Thọ (壽) - Trường thọ', value: '壽' },
  { label: 'Chữ Tổ (祖) - Tiên tổ', value: '祖' },
  { label: 'Chữ Tông (宗) - Tông miếu', value: '宗' },
  { label: 'Chữ Hiếu (孝) - Hiếu kính', value: '孝' },
  { label: 'Họ Nguyễn (阮)', value: 'Nguyễn' },
  { label: 'Họ Trần (陳)', value: 'Trần' },
  { label: 'Họ Lê (黎)', value: 'Lê' },
  { label: 'Họ Phạm (范)', value: 'Phạm' },
  { label: 'Họ Hoàng / Huỳnh (黃)', value: 'Hoàng' },
  { label: 'Họ Vũ / Võ (武)', value: 'Vũ' },
  { label: 'Họ Đặng (鄧)', value: 'Đặng' },
  { label: 'Họ Bùi (裴)', value: 'Bùi' },
  { label: 'Họ Đỗ (杜)', value: 'Đỗ' },
  { label: 'Họ Ngô (吳)', value: 'Ngô' },
];

export const SHAPE_OPTIONS: { id: LogoShapeKey; name: string; class: string }[] = [
  { id: 'rounded-xl', name: 'Vuông Bo Góc', class: 'rounded-xl' },
  { id: 'rounded-full', name: 'Hình Tròn', class: 'rounded-full' },
  { id: 'rounded-3xl', name: 'Gia Huy Mềm', class: 'rounded-3xl' },
  { id: 'rounded-none', name: 'Góc Cổ Điển', class: 'rounded-none' },
];

export function getClanTheme(clan?: ClanInfo | null) {
  const colorKey = (clan?.theme_color as ThemeColorKey) || 'amber';
  const bgKey = (clan?.bg_style as BgStyleKey) || 'dark';
  const patternKey = (clan?.pattern_style as PatternStyleKey) || 'dongson';
  const logoShape = (clan?.logo_shape as LogoShapeKey) || 'rounded-xl';
  const logoText = clan?.logo_text || '氏';
  const logoUrl = clan?.logo_url || null;

  const color = THEME_COLORS[colorKey] || THEME_COLORS.amber;
  const bg = BG_STYLES[bgKey] || BG_STYLES.dark;

  return {
    colorKey,
    bgKey,
    patternKey,
    logoShape,
    logoText,
    logoUrl,
    color,
    bg,
  };
}

// Applies CSS variables to document for dynamic coloring
export function applyThemeVariables(theme: ReturnType<typeof getClanTheme>) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.color.hex);
  root.style.setProperty('--theme-accent', theme.color.accentHex);
  root.style.setProperty('--theme-border', theme.color.borderHex);
  root.style.setProperty('--theme-light', theme.color.lightHex);
}
