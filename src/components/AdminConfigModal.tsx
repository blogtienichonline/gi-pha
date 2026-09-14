import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Users,
  Database,
  Smartphone,
  Check,
  Trash2,
  Key,
  Shield,
  Clock,
  Copy,
  CheckCheck,
  Server,
  AlertCircle,
  Plus,
  Palette,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Eye,
  Type,
  Share2,
  Globe,
  Maximize2,
  Minimize2,
  Layers,
  Landmark,
  Calendar,
  MapPin,
  ScrollText,
  BookOpen,
  Code,
  ArrowRight,
  EyeOff,
} from 'lucide-react';
import { ClanInfo, SystemStatus, User, Member, TursoTestResult, TursoConfigInfo } from '../types.ts';
import { api } from '../services/api.ts';
import { BulkMemberManager } from './BulkMemberManager.tsx';
import {
  THEME_COLORS,
  BG_STYLES,
  PATTERN_STYLES,
  LOGO_SHAPES,
  COMMON_CLAN_CHARACTERS,
  ThemeColorKey,
  BgStyleKey,
  PatternStyleKey,
  LogoShapeKey,
  getClanTheme,
} from '../theme.ts';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: ClanInfo | null;
  onClanUpdated: (updated: ClanInfo) => void;
  members?: Member[];
  onRefreshData?: () => void;
  initialTab?: 'clan' | 'theme' | 'seo' | 'bulk' | 'users' | 'system' | 'mobile-api';
  onOpenDocs?: () => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  clan,
  onClanUpdated,
  members = [],
  onRefreshData,
  initialTab = 'clan',
  onOpenDocs,
}) => {
  const [activeTab, setActiveTab] = useState<'clan' | 'theme' | 'seo' | 'bulk' | 'users' | 'system' | 'mobile-api'>(initialTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Clan Form State
  const [clanName, setClanName] = useState('');
  const [ancestorName, setAncestorName] = useState('');
  const [origin, setOrigin] = useState('');
  const [templeAddress, setTempleAddress] = useState('');
  const [anniversaryLunar, setAnniversaryLunar] = useState('');
  const [clanDescription, setClanDescription] = useState('');
  const [clanSaving, setClanSaving] = useState(false);
  const [clanSuccess, setClanSuccess] = useState(false);

  // Theme & Styling State
  const [themeColor, setThemeColor] = useState<ThemeColorKey>('amber');
  const [bgStyle, setBgStyle] = useState<BgStyleKey>('dark');
  const [patternStyle, setPatternStyle] = useState<PatternStyleKey>('dongson');
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('氏');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoShape, setLogoShape] = useState<LogoShapeKey>('rounded-xl');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // SEO & Social State
  const [seoTitle, setSeoTitle] = useState('Remix Quản Lý Gia Phả');
  const [seoDescription, setSeoDescription] = useState('Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF truyền thống.');
  const [seoKeywords, setSeoKeywords] = useState('gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn');
  const [ogImageUrl, setOgImageUrl] = useState('https://cdn.upanhlaylink.com/i/NVk3RyLC.png');
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoSuccess, setSeoSuccess] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Users State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [userError, setUserError] = useState<string | null>(null);
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  // System Status State
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Turso Direct Connection State
  const [tursoConfigInfo, setTursoConfigInfo] = useState<TursoConfigInfo | null>(null);
  const [tursoUrlInput, setTursoUrlInput] = useState('');
  const [tursoTokenInput, setTursoTokenInput] = useState('');
  const [showTursoToken, setShowTursoToken] = useState(false);
  const [seedDataOnConnect, setSeedDataOnConnect] = useState(true);
  const [isSavingTurso, setIsSavingTurso] = useState(false);
  const [tursoSaveSuccess, setTursoSaveSuccess] = useState<string | null>(null);
  const [tursoSaveError, setTursoSaveError] = useState<string | null>(null);
  const [isResettingTurso, setIsResettingTurso] = useState(false);
  const [isSeedingTurso, setIsSeedingTurso] = useState(false);
  const [tursoSeedMsg, setTursoSeedMsg] = useState<string | null>(null);

  // Turso Live Diagnostic Test State
  const [tursoTestResult, setTursoTestResult] = useState<TursoTestResult | null>(null);
  const [isTestingTurso, setIsTestingTurso] = useState(false);
  const [tursoTestError, setTursoTestError] = useState<string | null>(null);

  // Copied helper
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (clan) {
      setClanName(clan.name || '');
      setAncestorName(clan.ancestor_name || '');
      setOrigin(clan.origin || '');
      setTempleAddress(clan.temple_address || '');
      setAnniversaryLunar(clan.anniversary_lunar || '');
      setClanDescription(clan.description || '');

      setThemeColor((clan.theme_color as ThemeColorKey) || 'amber');
      setBgStyle((clan.bg_style as BgStyleKey) || 'dark');
      setPatternStyle((clan.pattern_style as PatternStyleKey) || 'dongson');
      setLogoType(clan.logo_url ? 'image' : 'text');
      setLogoText(clan.logo_text || '氏');
      setLogoUrl(clan.logo_url || '');
      setLogoShape((clan.logo_shape as LogoShapeKey) || 'rounded-xl');

      setSeoTitle(clan.seo_title || 'Remix Quản Lý Gia Phả');
      setSeoDescription(clan.seo_description || clan.description || 'Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF truyền thống.');
      setSeoKeywords(clan.seo_keywords || 'gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn');
      setOgImageUrl(clan.og_image_url || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png');
    }
  }, [clan]);

  // Handle saving UI style & branding settings
  const handleSaveTheme = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setThemeSaving(true);
    setThemeError(null);
    try {
      const updated: Partial<ClanInfo> = {
        theme_color: themeColor,
        bg_style: bgStyle,
        pattern_style: patternStyle,
        logo_url: logoType === 'image' && logoUrl.trim() ? logoUrl.trim() : null,
        logo_text: logoText.trim() || '氏',
        logo_shape: logoShape,
      };
      await api.updateClanInfo(updated);
      onClanUpdated({
        ...clan,
        ...updated,
      } as ClanInfo);
      setThemeSuccess(true);
      setTimeout(() => setThemeSuccess(false), 3500);
    } catch (err: any) {
      console.error(err);
      setThemeError('Không thể lưu cài đặt giao diện. Vui lòng thử lại.');
    } finally {
      setThemeSaving(false);
    }
  };

  // Upload logo from local file
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setThemeError('Dung lượng ảnh logo nên dưới 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        setLogoType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to default theme
  const handleResetTheme = () => {
    setThemeColor('amber');
    setBgStyle('dark');
    setPatternStyle('dongson');
    setLogoType('text');
    setLogoText('氏');
    setLogoUrl('');
    setLogoShape('rounded-xl');
  };

  // Handle saving SEO & Social share configuration
  const handleSaveSeo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSeoSaving(true);
    setSeoError(null);
    try {
      const updated: Partial<ClanInfo> = {
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        seo_keywords: seoKeywords.trim(),
        og_image_url: ogImageUrl.trim() || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
      };
      await api.updateClanInfo(updated);
      onClanUpdated({
        ...clan,
        ...updated,
      } as ClanInfo);

      if (typeof document !== 'undefined') {
        document.title = seoTitle.trim() || 'Remix Quản Lý Gia Phả';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', seoDescription.trim());
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', seoTitle.trim());
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', seoDescription.trim());
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', ogImageUrl.trim() || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png');
        const ogImgSec = document.querySelector('meta[property="og:image:secure_url"]');
        if (ogImgSec) ogImgSec.setAttribute('content', ogImageUrl.trim() || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png');
      }

      setSeoSuccess(true);
      setTimeout(() => setSeoSuccess(false), 3500);
    } catch (err: any) {
      console.error(err);
      setSeoError('Không thể lưu cấu hình SEO & Mạng xã hội. Vui lòng thử lại.');
    } finally {
      setSeoSaving(false);
    }
  };

  // Load users or system status when tab is opened
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'system') {
      loadSystemStatus();
      loadTursoConfigInfo();
    }
  }, [isOpen, activeTab]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await api.getUsers();
      setUsersList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadTursoConfigInfo = async () => {
    try {
      const res = await api.getTursoConfig();
      if (res.success && res.data) {
        setTursoConfigInfo(res.data);
        if (res.data.isCustom && res.data.url) {
          setTursoUrlInput(res.data.url);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin Turso:', err);
    }
  };

  const loadSystemStatus = async () => {
    setStatusLoading(true);
    try {
      const stat = await api.getSystemStatus();
      setSystemStatus(stat);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveTursoConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tursoUrlInput.trim()) {
      setTursoSaveError('Vui lòng nhập URL cơ sở dữ liệu Turso (libsql://...).');
      return;
    }
    if (!tursoTokenInput.trim()) {
      setTursoSaveError('Vui lòng nhập Auth Token xác thực của Turso.');
      return;
    }

    setIsSavingTurso(true);
    setTursoSaveError(null);
    setTursoSaveSuccess(null);

    try {
      const res = await api.updateTursoConfig({
        databaseUrl: tursoUrlInput.trim(),
        authToken: tursoTokenInput.trim(),
        seedSampleData: seedDataOnConnect,
      });

      setTursoSaveSuccess(
        `Kết nối trực tiếp thành công vào máy chủ: ${res.host} (Độ trễ: ${res.latencyMs}ms)! Toàn bộ dữ liệu gia phả giờ đây sẽ đọc & ghi trực tiếp vào Turso này.`
      );
      setTursoTokenInput('');

      // Refresh system status & config
      await Promise.all([loadSystemStatus(), loadTursoConfigInfo()]);

      // Reload clan data from new database
      const clanRes = await api.getClanInfo();
      if (clanRes) {
        onClanUpdated(clanRes);
      }
    } catch (err: any) {
      console.error('Lỗi kết nối Turso:', err);
      setTursoSaveError(err.message || 'Không thể kết nối vào Turso. Vui lòng kiểm tra lại URL và Token.');
    } finally {
      setIsSavingTurso(false);
    }
  };

  const handleResetTursoDefault = async () => {
    if (!confirm('Bạn có chắc chắn muốn khôi phục về kết nối CSDL Turso mặc định của hệ thống?')) {
      return;
    }

    setIsResettingTurso(true);
    setTursoSaveError(null);
    setTursoSaveSuccess(null);

    try {
      const res = await api.resetTursoDefault();
      setTursoSaveSuccess(`Đã chuyển về CSDL Turso mặc định (${res.host}).`);
      setTursoUrlInput('');
      setTursoTokenInput('');

      await Promise.all([loadSystemStatus(), loadTursoConfigInfo()]);

      const clanRes = await api.getClanInfo();
      if (clanRes) {
        onClanUpdated(clanRes);
      }
    } catch (err: any) {
      setTursoSaveError(err.message || 'Lỗi khi khôi phục CSDL mặc định.');
    } finally {
      setIsResettingTurso(false);
    }
  };

  const handleSeedTurso = async () => {
    if (!confirm('Hành động này sẽ nạp cây phả hệ mẫu Họ Phạm (10 thành viên, 4 đời) vào CSDL Turso đang kết nối. Tiếp tục?')) {
      return;
    }

    setIsSeedingTurso(true);
    setTursoSeedMsg(null);

    try {
      const res = await api.seedTursoDatabase();
      setTursoSeedMsg(res.message);
      await loadSystemStatus();
      const clanRes = await api.getClanInfo();
      if (clanRes) {
        onClanUpdated(clanRes);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nạp dữ liệu mẫu.');
    } finally {
      setIsSeedingTurso(false);
    }
  };

  const handleRunTursoDiagnostic = async () => {
    setIsTestingTurso(true);
    setTursoTestError(null);
    try {
      const res = await api.testTursoDatabase();
      setTursoTestResult(res);
      // Also refresh stats
      loadSystemStatus();
    } catch (err: any) {
      console.error(err);
      setTursoTestError(err.message || 'Lỗi khi kiểm tra kết nối và đọc/ghi Turso.');
    } finally {
      setIsTestingTurso(false);
    }
  };

  const handleSaveClan = async (e: React.FormEvent) => {
    e.preventDefault();
    setClanSaving(true);
    try {
      const updated: Partial<ClanInfo> = {
        name: clanName.trim(),
        ancestor_name: ancestorName.trim() || null as any,
        origin: origin.trim() || null as any,
        temple_address: templeAddress.trim() || null as any,
        anniversary_lunar: anniversaryLunar.trim() || null as any,
        description: clanDescription.trim() || null as any,
      };
      await api.updateClanInfo(updated);
      onClanUpdated({ ...clan, ...updated } as ClanInfo);
      setClanSuccess(true);
      setTimeout(() => setClanSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setClanSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    if (!newUsername.trim() || !newPassword.trim() || !newFullName.trim()) {
      setUserError('Vui lòng điền đủ thông tin tài khoản.');
      return;
    }

    try {
      const res = await api.createUser({
        username: newUsername.trim(),
        password: newPassword.trim(),
        full_name: newFullName.trim(),
        role: newRole,
      });

      if (!res.success) {
        setUserError(res.message || 'Lỗi khi tạo tài khoản.');
        return;
      }

      setUserSuccess(`Đã tạo tài khoản "${newUsername}" thành công.`);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('editor');
      loadUsers();
      setTimeout(() => setUserSuccess(null), 3500);
    } catch (err: any) {
      setUserError(err.message || 'Lỗi khi tạo tài khoản.');
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'ducphi') {
      alert('Không thể xóa tài khoản Quản trị viên chính ducphi.');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) return;

    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa người dùng.');
    }
  };

  const copyToClipboard = (text: string, endpointId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpointId);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'} bg-black/85 backdrop-blur-xs animate-in fade-in duration-150`}>
      <div
        id="admin-config-modal"
        className={`bg-stone-900 border border-stone-700/80 flex flex-col shadow-2xl overflow-hidden text-stone-100 transition-all duration-150 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-none'
            : 'w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] h-[93vh] max-h-[96vh] rounded-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <span>Bảng Điều Khiển Quản Trị Hệ Thống</span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-full font-mono font-normal">
                  Họ Phạm
                </span>
              </h2>
              <p className="text-[11px] text-stone-400">Quản trị toàn diện: Cây gia phả, thành viên hàng loạt, giao diện & hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title={isFullscreen ? 'Thu nhỏ kích thước' : 'Mở rộng toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              title="Đóng bảng quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-stone-800 bg-stone-950/40 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('clan')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'clan'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Thông Tin Dòng Họ
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bulk'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Thêm / Xóa Hàng Loạt</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-amber-500/20 text-amber-300 rounded font-bold">Mới</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'theme'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Giao Diện & Logo
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'seo'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            SEO & Chia Sẻ MXH
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tài Khoản & Phân Quyền
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'system'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Trạng Thái Cơ Sở Dữ Liệu
          </button>

          <button
            onClick={() => setActiveTab('mobile-api')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'mobile-api'
                ? 'text-amber-400 border-amber-500 bg-stone-900'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            API Cho Mobile App
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB: QUẢN LÝ HÀNG LOẠT (THÊM / XÓA) */}
          {activeTab === 'bulk' && (
            <div className="h-full">
              <BulkMemberManager
                members={members}
                onRefreshData={onRefreshData || (() => {})}
                onClose={onClose}
              />
            </div>
          )}

          {/* TAB 1: THÔNG TIN DÒNG HỌ */}
          {activeTab === 'clan' && (
            <form onSubmit={handleSaveClan} className="w-full max-w-5xl mx-auto space-y-6 pb-6 animate-in fade-in duration-200">
              {clanSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg">
                  <div className="p-1 rounded-full bg-emerald-800 text-white">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold">Lưu thành công!</strong>
                    <span>Thông tin gia tộc và truyền thống dòng họ đã được cập nhật trên toàn hệ thống.</span>
                  </div>
                </div>
              )}

              {/* Clan Header Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/50 flex items-center justify-center font-serif text-xl font-bold text-amber-100 shadow-lg">
                    {clanName ? clanName.split(' ').pop()?.[0] || 'Phạm' : '氏'}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-amber-200 flex items-center gap-2">
                      <span>{clanName || 'Gia Tộc Họ Phạm'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/80 font-mono">
                        Chính Tộc
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      {ancestorName ? `Thủy Tổ: ${ancestorName}` : 'Khởi dựng cơ đồ • Lưu truyền bách thế'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setClanName('Gia Tộc Họ Phạm');
                      setAncestorName('Cụ Thủy Tổ Phạm Viết Đại');
                      setOrigin('Làng Cổ Đông Ngạc, Bắc Từ Liêm, Hà Nội');
                      setAnniversaryLunar('Ngày 16 tháng Giêng (Âm Lịch)');
                      setTempleAddress('Nhà Thờ Tổ Họ Phạm, Thôn Đông, xã Đông Ngạc, Hà Nội');
                      setClanDescription('Ẩm thủy tư nguyên - Uống nước nhớ nguồn. Con cháu dòng họ Phạm đời đời ghi nhớ công đức tổ tiên, phát huy truyền thống hiếu học, đoàn kết tương thân tương ái, rạng danh non sông đất nước.');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-700 bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nạp Chuẩn Họ Phạm</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Basic Clan Info */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-800/80 text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  <span>1. Danh Xưng Dòng Họ & Thủy Tổ Khởi Nguồn</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                      <span>Tên Dòng Họ / Gia Tộc</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={clanName}
                        onChange={(e) => setClanName(e.target.value)}
                        placeholder="Ví dụ: Gia Tộc Họ Phạm"
                        className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm sm:text-base text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors shadow-inner"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">Tên chính thức hiển thị tại tiêu đề chính, cây phả hệ và thẻ trang.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                      <ScrollText className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>Thủy Tổ / Tiên Tổ Khởi Phát</span>
                    </label>
                    <input
                      type="text"
                      value={ancestorName}
                      onChange={(e) => setAncestorName(e.target.value)}
                      placeholder="Ví dụ: Cụ Thủy Tổ Phạm Viết Đại"
                      className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm sm:text-base text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors shadow-inner"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Vị tổ khởi nghiệp đặt tại gốc sơ đồ phả hệ (Đời 1).</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Heritage, Origin & Commemoration */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-800/80 text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>2. Địa Danh, Từ Đường & Ngày Giỗ Tổ Truyền Thống</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>Quê Quán Gốc / Nguyên Quán</span>
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Ví dụ: Đông Ngạc, Bắc Từ Liêm, Hà Nội"
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors shadow-inner"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Địa chỉ phát tích cội nguồn.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>Ngày Giỗ Tổ (Âm Lịch)</span>
                    </label>
                    <input
                      type="text"
                      value={anniversaryLunar}
                      onChange={(e) => setAnniversaryLunar(e.target.value)}
                      placeholder="Ví dụ: Ngày 16 tháng Giêng (AL)"
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors shadow-inner"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Ngày tụ hội tế tổ toàn tộc hàng năm.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-stone-400" />
                      <span>Địa Chỉ Từ Đường / Nhà Thờ Họ</span>
                    </label>
                    <input
                      type="text"
                      value={templeAddress}
                      onChange={(e) => setTempleAddress(e.target.value)}
                      placeholder="Ví dụ: Nhà Thờ Tổ Thôn Đông, xã Đông Ngạc..."
                      className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors shadow-inner"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">Nơi phụng thờ hương hỏa chính.</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Clan Creed & Philosophy */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>3. Lời Tựa Gia Phả, Tôn Chỉ & Huấn Từ Dòng Họ</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setClanDescription('Ẩm thủy tư nguyên - Uống nước nhớ nguồn. Dòng họ Phạm nghìn năm văn hiến, con cháu đồng lòng phát huy truyền thống cần cù, hiếu học, rạng danh tiên tổ, muôn đời hưng thịnh.');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                  >
                    Gợi ý mẫu tôn chỉ
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                    Nội Dung Lời Tựa / Huấn Từ Khắc Ghi
                  </label>
                  <textarea
                    rows={5}
                    value={clanDescription}
                    onChange={(e) => setClanDescription(e.target.value)}
                    placeholder="Ghi lại tôn chỉ, truyền thống hiếu học, rạng danh con cháu, lời nhắn nhủ của tiền nhân..."
                    className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm sm:text-base text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 leading-relaxed transition-colors shadow-inner resize-y min-h-[120px]"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Lời tựa này sẽ được trang trọng hiển thị trên trang giới thiệu gia tộc và phần đầu khi xuất bản tệp phả hệ.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="text-xs text-stone-400">
                  <span>Thay đổi sẽ được áp dụng ngay trên cây gia phả và các trang liên quan.</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (clan) {
                        setClanName(clan.name || '');
                        setAncestorName(clan.ancestor_name || '');
                        setOrigin(clan.origin || '');
                        setTempleAddress(clan.temple_address || '');
                        setAnniversaryLunar(clan.anniversary_lunar || '');
                        setClanDescription(clan.description || '');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Hủy Thay Đổi
                  </button>

                  <button
                    type="submit"
                    disabled={clanSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {clanSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Lưu Cập Nhật...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Lưu Cập Nhật Thông Tin Dòng Họ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: GIAO DIỆN & LOGO (ADMIN CUSTOMIZATION) */}
          {activeTab === 'theme' && (
            <div className="space-y-6 w-full max-w-5xl mx-auto pb-6">
              {/* Status notifications */}
              {themeSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Đã lưu cài đặt giao diện và logo dòng họ thành công vào cơ sở dữ liệu!</span>
                </div>
              )}

              {themeError && (
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{themeError}</span>
                </div>
              )}

              {/* Real-time Interactive Preview Card */}
              <div className="rounded-2xl border border-stone-800 bg-stone-950/90 p-4 sm:p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> Xem Trước Giao Diện Trực Tiếp
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium">Thay đổi lập tức theo cấu hình bên dưới</span>
                </div>

                {/* Mock Header Preview */}
                <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  bgStyle === 'light'
                    ? 'bg-amber-50/90 border-stone-300 text-stone-900 shadow-sm'
                    : bgStyle === 'wood'
                    ? 'bg-[#1e1510] border-[#3d2c20] text-stone-100'
                    : 'bg-stone-900 border-stone-800 text-stone-100'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Logo Preview */}
                      <div className={`w-10 h-10 ${logoShape} bg-gradient-to-br ${THEME_COLORS[themeColor].gradient} p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300`}>
                        {logoType === 'image' && logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className={`w-full h-full object-cover ${logoShape}`}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className={`w-full h-full ${bgStyle === 'light' ? 'bg-white/90' : 'bg-stone-950/85'} ${logoShape} flex items-center justify-center font-bold text-lg ${THEME_COLORS[themeColor].textAccent}`}>
                            {logoText || '氏'}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${
                            bgStyle === 'light' ? 'text-stone-900' : THEME_COLORS[themeColor].textTitle
                          }`}>
                            {clanName || 'Gia Phả Đại Tộc'}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${THEME_COLORS[themeColor].badgeBg} ${THEME_COLORS[themeColor].badgeText} ${THEME_COLORS[themeColor].badgeBorder}`}>
                            4 Thế hệ • 28 Đinh
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${bgStyle === 'light' ? 'text-stone-600' : 'text-stone-400'}`}>
                          {ancestorName ? `Thủy tổ: ${ancestorName}` : 'Gia phả lưu truyền vạn thế'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shadow-sm ${THEME_COLORS[themeColor].primaryBtn}`}>
                        + Thêm
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Member Node Preview */}
                <div className="mt-3 pt-3 border-t border-stone-850 border-stone-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-[11px]">Thẻ thành viên mẫu:</span>
                    <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 ${
                      bgStyle === 'light'
                        ? 'bg-white border-stone-300 text-stone-900'
                        : 'bg-stone-900 border-stone-700 text-stone-100'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center text-[10px] font-bold text-stone-200">
                        1
                      </div>
                      <span className="font-semibold text-xs">{ancestorName || 'Cụ Thủy Tổ'}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${THEME_COLORS[themeColor].badgeBg} ${THEME_COLORS[themeColor].badgeText} ${THEME_COLORS[themeColor].badgeBorder}`}>
                        Đời 1
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Màu: <strong className={THEME_COLORS[themeColor].textAccent}>{THEME_COLORS[themeColor].name}</strong>
                  </span>
                </div>
              </div>

              {/* 1. LOGO CONFIGURATION */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 1. Logo & Biểu Tượng Dòng Họ
                  </h3>
                  <div className="flex items-center bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setLogoType('text')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        logoType === 'text'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Ký Tự / Chữ
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoType('image')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        logoType === 'image'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Hình Ảnh Logo
                    </button>
                  </div>
                </div>

                {/* A. Text Logo Option */}
                {logoType === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Ký Tự Biểu Tượng (Chữ Hán / Chữ Nôm / Chữ Quốc Ngữ viết hoa)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={logoText}
                          onChange={(e) => setLogoText(e.target.value)}
                          placeholder="Ví dụ: 氏, Phúc, Đức, Nguyễn..."
                          className="w-full max-w-xs px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                        />
                        <div className="text-xs text-stone-400">
                          (Khuyên dùng 1-2 ký tự để hiển thị rõ nhất)
                        </div>
                      </div>
                    </div>

                    {/* Quick Surname Chips */}
                    <div>
                      <span className="block text-[11px] text-stone-400 mb-1.5 font-medium">
                        Chọn nhanh họ tộc hoặc chữ phúc đức truyền thống:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_CLAN_CHARACTERS.map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => setLogoText(char)}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                              logoText === char
                                ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-xs'
                                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-600/70 hover:text-amber-300'
                            }`}
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* B. Image Logo Option */}
                {logoType === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Đường Dẫn Hình Ảnh Logo (URL trực tuyến)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo-dong-ho.png"
                          className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                        {logoUrl && (
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="px-2.5 py-2 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Upload File Directly */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg border border-stone-700 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tải ảnh từ thiết bị...</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLogoFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-500">
                        Định dạng PNG, JPG, SVG trong suốt hoặc hình vuông (tối đa 2MB)
                      </span>
                    </div>

                    {/* Quick emblems */}
                    <div className="pt-2">
                      <span className="block text-[11px] text-stone-400 mb-1.5 font-medium">
                        Hoặc chọn nhanh biểu tượng gia tộc có sẵn:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLogoUrl('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=160&auto=format&fit=crop&q=80');
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
                        >
                          Huy Hiệu Vàng Cổ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLogoUrl('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=160&auto=format&fit=crop&q=80');
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
                        >
                          Từ Đường Hoàng Kim
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Frame Shape */}
                <div className="pt-2 border-t border-stone-800/80">
                  <label className="block text-xs font-semibold text-stone-300 mb-2">
                    Hình Dáng Khung Viền Logo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {LOGO_SHAPES.map((shape) => (
                      <button
                        key={shape.key}
                        type="button"
                        onClick={() => setLogoShape(shape.key as LogoShapeKey)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                          logoShape === shape.key
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-sm'
                            : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        <div className={`w-8 h-8 ${shape.class} bg-gradient-to-br ${THEME_COLORS[themeColor].gradient} flex items-center justify-center text-xs font-bold text-white shadow-xs`}>
                          氏
                        </div>
                        <span className="text-[11px] font-semibold">{shape.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. THEME COLOR PALETTE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> 2. Bảng Màu Tông Tộc Chủ Đạo
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Áp dụng cho nút bấm, viền phả hệ & huy hiệu
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(THEME_COLORS) as ThemeColorKey[]).map((key) => {
                    const col = THEME_COLORS[key];
                    const isSelected = themeColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setThemeColor(key)}
                        className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                          isSelected
                            ? 'bg-stone-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-stone-950 border-stone-800/90 hover:border-stone-700 hover:bg-stone-900/50'
                        }`}
                      >
                        {/* Swatch */}
                        <div
                          className="w-10 h-10 rounded-xl shadow-md shrink-0 flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: col.hex }}
                        >
                          <div className={`w-full h-full bg-gradient-to-br ${col.gradient} opacity-90`} />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                              <Check className="w-4 h-4 text-white drop-shadow" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-200'}`}>
                              {col.name}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {col.hex}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            {col.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. BACKGROUND MOOD */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> 3. Phong Cách Nền & Ánh Sáng
                  </h3>
                  <span className="text-[11px] text-stone-400">Chọn chế độ không gian từ đường</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(BG_STYLES) as BgStyleKey[]).map((key) => {
                    const bg = BG_STYLES[key];
                    const isSelected = bgStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBgStyle(key)}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-stone-900 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                            : 'bg-stone-950 border-stone-800/90 hover:border-stone-700'
                        }`}
                      >
                        <div className={`w-full h-12 rounded-lg border flex items-center justify-center text-xs font-semibold ${
                          key === 'light'
                            ? 'bg-stone-100 border-stone-300 text-stone-800'
                            : key === 'wood'
                            ? 'bg-[#180e0a] border-[#382015] text-amber-200'
                            : 'bg-stone-950 border-stone-800 text-stone-200'
                        }`}>
                          {bg.name}
                        </div>
                        <span className="text-[11px] text-stone-400">{bg.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. PATTERN WATERMARK */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 4. Họa Tiết Nền Cổ Truyền
                  </h3>
                  <span className="text-[11px] text-stone-400">Vân nền truyền thống chìm phía sau</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(PATTERN_STYLES) as PatternStyleKey[]).map((key) => {
                    const pat = PATTERN_STYLES[key];
                    const isSelected = patternStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPatternStyle(key)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold shadow-xs'
                            : 'bg-stone-950 border-stone-800/90 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        <span className="block text-xs">{pat.name}</span>
                        <span className="block text-[10px] text-stone-500 mt-0.5">{pat.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. ACTION BUTTONS */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={handleResetTheme}
                  className="px-4 py-2.5 rounded-lg border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Khôi Phục Mặc Định</span>
                </button>

                <button
                  type="button"
                  disabled={themeSaving}
                  onClick={() => handleSaveTheme()}
                  className={`px-6 py-2.5 ${THEME_COLORS[themeColor].primaryBtn} font-bold rounded-lg text-xs shadow-lg transition-all flex items-center gap-2`}
                >
                  {themeSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{themeSaving ? 'Đang Lưu Giao Diện...' : 'Lưu Cài Đặt Giao Diện & Logo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TÀI KHOẢN & PHÂN QUYỀN */}
          {activeTab === 'users' && (
            <div className="space-y-6 w-full max-w-5xl mx-auto pb-6">
              {/* Add user form */}
              <div className="bg-stone-950/60 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Tạo Tài Khoản Mới
                </h3>

                {userError && (
                  <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                    {userError}
                  </div>
                )}
                {userSuccess && (
                  <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
                    {userSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Tên đăng nhập</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="vd: bientap_01"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu bí mật"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Họ và tên người dùng</label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="vd: Nguyễn Văn A"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">Vai trò phân quyền</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="editor">Biên tập viên (Thêm, sửa thành viên)</option>
                      <option value="admin">Quản trị viên (Toàn quyền)</option>
                      <option value="viewer">Người xem (Chỉ xem)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Tạo Tài Khoản
                    </button>
                  </div>
                </form>
              </div>

              {/* Users list */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Danh sách tài khoản ({usersList.length})
                </h4>

                {usersLoading ? (
                  <div className="py-6 text-center text-xs text-stone-500">Đang tải danh sách...</div>
                ) : (
                  <div className="divide-y divide-stone-800 border border-stone-800 rounded-xl overflow-hidden bg-stone-950/40">
                    {usersList.map((u) => (
                      <div key={u.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-amber-400">
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-200 flex items-center gap-2">
                              <span>{u.full_name}</span>
                              <span className="font-mono text-stone-400 text-[11px]">(@{u.username})</span>
                            </div>
                            <span
                              className={`inline-block px-1.5 py-0.2 text-[10px] rounded font-medium mt-0.5 ${
                                u.role === 'admin'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                  : u.role === 'editor'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                  : 'bg-stone-800 text-stone-400'
                              }`}
                            >
                              {u.role === 'admin'
                                ? 'Quản trị viên (Admin)'
                                : u.role === 'editor'
                                ? 'Biên tập viên (Editor)'
                                : 'Người xem (Viewer)'}
                            </span>
                          </div>
                        </div>

                        {u.username !== 'ducphi' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRẠNG THÁI CƠ SỞ DỮ LIỆU */}
          {activeTab === 'system' && (
            <div className="space-y-5 w-full max-w-5xl mx-auto pb-6">
              {/* Card 1: Kết Nối Trực Tiếp Turso (Direct Turso Cloud Connection) */}
              <div className="p-4 sm:p-6 rounded-2xl bg-stone-950/70 border border-amber-900/40 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-sm sm:text-base text-stone-100">
                        Cấu Hình Đọc & Ghi Trực Tiếp Turso Database
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      Nhập địa chỉ URL và Auth Token của Turso database của bạn để hệ thống đọc & ghi dữ liệu trực tiếp vào tài khoản Turso của bạn.
                    </p>
                  </div>

                  {tursoConfigInfo?.isCustom && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetTursoDefault}
                        disabled={isResettingTurso}
                        className="px-3 py-1.5 rounded-lg text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                        title="Chuyển về cơ sở dữ liệu mặc định hệ thống"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isResettingTurso ? 'animate-spin' : ''}`} />
                        <span>{isResettingTurso ? 'Đang khôi phục...' : 'Về Turso mặc định'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {tursoSaveSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold block">{tursoSaveSuccess}</span>
                    </div>
                  </div>
                )}

                {tursoSaveError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{tursoSaveError}</span>
                  </div>
                )}

                {tursoSeedMsg && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/70 text-amber-200 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{tursoSeedMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveTursoConnection} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-stone-300">
                        URL Turso Database (<code className="text-amber-300 font-mono">libsql://...</code>)
                      </label>
                      <input
                        type="text"
                        value={tursoUrlInput}
                        onChange={(e) => setTursoUrlInput(e.target.value)}
                        placeholder="libsql://ten-database-cua-ban.turso.io"
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 font-mono text-xs focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-[11px] text-stone-400 block">
                        Lấy từ lệnh <code className="text-amber-300/90 font-mono">turso db show &lt;db-name&gt;</code> hoặc trên dashboard.turso.tech.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block font-semibold text-stone-300">
                          Turso Auth Token
                        </label>
                        {tursoConfigInfo?.tokenMasked && !tursoTokenInput && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            Hiện tại: {tursoConfigInfo.tokenMasked}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showTursoToken ? 'text' : 'password'}
                          value={tursoTokenInput}
                          onChange={(e) => setTursoTokenInput(e.target.value)}
                          placeholder={tursoConfigInfo?.tokenMasked ? 'Nhập token mới nếu muốn thay đổi...' : 'eyJhbGciOi...'}
                          className="w-full px-3 py-2.5 pr-10 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 font-mono text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTursoToken(!showTursoToken)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
                          title={showTursoToken ? 'Ẩn Token' : 'Hiện Token'}
                        >
                          {showTursoToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-stone-400 block">
                        Tạo token bằng lệnh <code className="text-amber-300/90 font-mono">turso db tokens create &lt;db-name&gt;</code>.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={seedDataOnConnect}
                        onChange={(e) => setSeedDataOnConnect(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-700 text-amber-500 focus:ring-amber-400 bg-stone-950"
                      />
                      <span className="text-stone-300 text-xs">
                        Tự động nạp cây phả hệ mẫu Họ Phạm (10 thành viên, 4 đời) vào CSDL Turso này
                      </span>
                    </label>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {tursoConfigInfo?.isCustom && (
                        <button
                          type="button"
                          onClick={handleSeedTurso}
                          disabled={isSeedingTurso}
                          className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                          title="Nạp lại phả hệ mẫu vào database đang kết nối"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isSeedingTurso ? 'animate-spin' : ''}`} />
                          <span>{isSeedingTurso ? 'Đang nạp dữ liệu...' : 'Nạp lại mẫu Họ Phạm'}</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingTurso}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isSavingTurso ? 'Đang kiểm tra & kết nối...' : 'Lưu & Kết Nối Vào Turso Này'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Card 2: Trạng thái kết nối Turso hiện hành */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm text-stone-200">
                      Trạng Thái CSDL Đang Kết Nối
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        loadSystemStatus();
                        loadTursoConfigInfo();
                      }}
                      disabled={statusLoading}
                      className="px-2.5 py-1 rounded-lg text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Làm mới trạng thái"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin text-amber-400' : ''}`} />
                      <span>{statusLoading ? 'Đang tải...' : 'Làm mới'}</span>
                    </button>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Đang hoạt động
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Nền tảng lưu trữ:</span>
                    <span className="font-semibold text-stone-200">Turso libSQL Cloud Database</span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Máy chủ Turso tiếp nhận:</span>
                    <span className="font-semibold text-amber-300 font-mono break-all">
                      {systemStatus?.database.host || 'giapha-hanzi.aws-ap-northeast-1.turso.io'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Nguồn cấu hình:</span>
                    {systemStatus?.database.isCustomTurso ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        Turso riêng của bạn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mặc Định Hệ Thống (Demo DB)
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Độ trễ truy vấn (Ping latency):</span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      {statusLoading ? 'Đang đo...' : `${systemStatus?.database.latencyMs || 25} ms`}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Tổng bản ghi thành viên:</span>
                    <span className="font-semibold text-amber-400 font-mono">
                      {systemStatus?.stats.membersCount || 0} thành viên
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 block text-[11px]">Số tài khoản quản trị:</span>
                    <span className="font-semibold text-stone-200 font-mono">
                      {systemStatus?.stats.usersCount || 0} tài khoản
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Công cụ Kiểm tra Đọc & Ghi Turso Trực Tiếp */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm text-stone-200">
                        Kiểm Tra Đọc & Ghi Turso Trực Tiếp (Live Diagnostic Test)
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">
                      Thực hiện chu trình kiểm tra thực tế: Ping ➔ Đọc số liệu ➔ Ghi (INSERT) ➔ Xác thực đọc lại (SELECT) ➔ Dọn dẹp (DELETE) trên Turso.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunTursoDiagnostic}
                    disabled={isTestingTurso}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0 disabled:opacity-50 active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingTurso ? 'animate-spin' : ''}`} />
                    <span>{isTestingTurso ? 'Đang kiểm tra đọc/ghi...' : 'Chạy Kiểm Tra Ngay'}</span>
                  </button>
                </div>

                {tursoTestError && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{tursoTestError}</span>
                  </div>
                )}

                {tursoTestResult && (
                  <div className="p-4 rounded-xl bg-stone-900/90 border border-emerald-800/60 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCheck className="w-4 h-4" />
                        {tursoTestResult.message}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(tursoTestResult.testedAt).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Máy chủ xử lý:</span>
                        <span className="text-stone-100 font-mono font-semibold ml-auto">{tursoTestResult.host}</span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Thời gian phản hồi (Roundtrip):</span>
                        <span className="text-emerald-400 font-mono font-semibold ml-auto">{tursoTestResult.latencyMs} ms</span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Đọc dữ liệu (Read Test):</span>
                        <span className="text-amber-300 font-mono font-semibold ml-auto">{tursoTestResult.readCount} thành viên</span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Ghi dữ liệu (Write Test - INSERT):</span>
                        <span className="text-emerald-400 font-semibold ml-auto">Thành công</span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Xác thực đọc lại (SELECT check):</span>
                        <span className="text-emerald-400 font-semibold ml-auto">Dữ liệu khớp</span>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-950/60 border border-stone-800/60">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-stone-300">Dọn dẹp bản ghi (DELETE check):</span>
                        <span className="text-emerald-400 font-semibold ml-auto">Đã dọn sạch</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-stone-900/80 border border-stone-800 text-xs text-stone-400 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bảo Mật Tối Đa:</strong> Toàn bộ thông tin cấu hình kết nối, mã định danh và
                    khóa bí mật được bảo vệ an toàn tại lớp máy chủ nội bộ. Không để lộ tên tệp tin hoặc
                    thông số hạ tầng ra phía giao diện người dùng.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API CHO MOBILE APP */}
          {activeTab === 'mobile-api' && (
            <div className="space-y-4 w-full max-w-5xl mx-auto pb-6">
              {/* Link to Full Docs Page */}
              {onOpenDocs && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-stone-900 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <Code className="w-4 h-4 text-amber-400" />
                      <span>Trang Tài Liệu REST API Chi Tiết & Sandbox Thử Nghiệm</span>
                    </div>
                    <p className="text-xs text-stone-300">
                      Mở giao diện tài liệu hoàn chỉnh với bộ tạo mã nguồn (cURL, Flutter, React Native, Swift, Kotlin) và công cụ gửi request kiểm tra trực tiếp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDocs();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0 active:scale-95"
                  >
                    <span>Mở Trang Docs API</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                Hệ thống máy chủ đã cung cấp <strong>đầy đủ 100%</strong> các chuẩn REST API JSON chuẩn hoá để đội ngũ phát triển ứng dụng di động (Flutter, React Native, iOS Swift, Android Kotlin) tích hợp đầy đủ mọi tính năng: Xác thực JWT, Cây phả hệ, Lịch giỗ & nhắc nhở, Thống kê thế hệ, Tìm kiếm và Quản lý nhân khẩu.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Đăng nhập & Đăng ký */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-400 border border-blue-800">
                        POST
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/auth/login</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('POST /api/auth/login {"username", "password"}', 'ep_login')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_login' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Đăng nhập tài khoản & nhận JWT token (expires 30 ngày) để lưu trữ vào Keychain / SecureStorage.
                  </p>
                </div>

                {/* 2. Đăng ký tài khoản */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-400 border border-blue-800">
                        POST
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/auth/register</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('POST /api/auth/register {"username", "password", "full_name"}', 'ep_reg')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_reg' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Đăng ký tài khoản thành viên mới tức thì cho người trong dòng họ.
                  </p>
                </div>

                {/* 3. Lấy thông tin & Đổi mật khẩu cá nhân */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-950 text-purple-400 border border-purple-800">
                        GET/PUT
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/auth/me & change-password</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/auth/me | PUT /api/auth/change-password', 'ep_me')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_me' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Kiểm tra phiên đăng nhập, lấy quyền (role) và cho phép người dùng tự đổi mật khẩu cá nhân trên mobile.
                  </p>
                </div>

                {/* 4. Thông tin dòng họ & Từ đường */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/clan</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/clan', 'ep_clan')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_clan' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Lấy danh xưng gia tộc, Thủy tổ, nguyên quán, địa chỉ từ đường, ngày giỗ tổ và huấn từ gia phong.
                  </p>
                </div>

                {/* 5. Cấu trúc cây phả hệ */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/tree</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/tree', 'ep_tree')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_tree' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Cấu trúc phân cấp lồng nhau (roots, children nodes) tối ưu hiển thị Interactive Tree View trên mobile.
                  </p>
                </div>

                {/* 6. Danh sách & Tìm kiếm thành viên */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/members</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/members?q={query}&generation={gen}&gender={gender}&is_alive={0|1}', 'ep_members')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_members' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Tìm kiếm thành viên siêu tốc theo họ tên, năm sinh (vd: 1975), lọc theo thế hệ (đời), giới tính, còn sống/đã mất.
                  </p>
                </div>

                {/* 7. Chi tiết thành viên & Quan hệ 3 thế hệ */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/members/:id</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/members/:id', 'ep_mem_detail')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_mem_detail' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Lấy hồ sơ trọn vẹn kèm danh sách cha/mẹ, con cái (thứ tự con), anh chị em ruột, số điện thoại, tiểu sử và phần mộ.
                  </p>
                </div>

                {/* 8. Lịch Giỗ & Nhắc nhở sự kiện (Mobile Push Notification) */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/anniversaries</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/anniversaries', 'ep_anni')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_anni' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Danh sách các ngày giỗ, ngày mất và giỗ tổ dòng họ để ứng dụng di động hiển thị lịch và cài đặt chuông nhắc nhở (Local Notification).
                  </p>
                </div>

                {/* 9. Thống kê & Phân tích thế hệ */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        GET
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/stats & /api/generations</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('GET /api/stats | GET /api/generations', 'ep_stats')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_stats' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Số liệu tổng quan nhân khẩu, phân bổ nam/nữ, tỉ lệ còn sống/đã mất và số lượng thành viên từng đời để vẽ biểu đồ mobile.
                  </p>
                </div>

                {/* 10. Thêm / Sửa / Xóa thành viên (CRUD) */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-400 border border-rose-800">
                        POST/PUT/DEL
                      </span>
                      <code className="text-xs font-mono text-stone-200">/api/members (CRUD)</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard('POST /api/members | PUT /api/members/:id | DELETE /api/members/:id', 'ep_crud')}
                      className="text-stone-400 hover:text-amber-400 p-1 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedEndpoint === 'ep_crud' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Cho phép tài khoản có quyền (Admin/Editor) thêm, cập nhật hoặc xóa thành viên với cơ chế kiểm tra chống nhảy cóc thế hệ và trùng thứ tự con.
                  </p>
                </div>
              </div>

              {/* Hướng dẫn Header Authorization */}
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5 text-xs text-stone-300">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Hướng dẫn truyền mã bảo mật (Authentication Header) trên Mobile:
                </div>
                <div className="p-2.5 rounded-lg bg-stone-950 font-mono text-[11px] text-stone-200">
                  Authorization: Bearer &lt;token_nhận_được_từ_api_login&gt;
                </div>
                <p className="text-[11px] text-stone-400">
                  Các API đọc dữ liệu (cây gia phả, thành viên, ngày giỗ, thống kê) có thể gọi công khai. Các API chỉnh sửa hoặc quản trị yêu cầu đính kèm Bearer Token vào Header.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: THIẾT LẬP SEO & CHIA SẺ MẠNG XÃ HỘI */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSaveSeo} className="space-y-6 w-full max-w-5xl mx-auto pb-6">
              {seoSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Cập nhật cấu hình SEO & Thẻ chia sẻ mạng xã hội thành công!</span>
                </div>
              )}

              {seoError && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{seoError}</span>
                </div>
              )}

              {/* Thông tin mô tả SEO */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  <span>Thông Tin Thẻ Tìm Kiếm (Google, Bing Search)</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Tiêu đề trang (Meta Title)
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Remix Quản Lý Gia Phả - Gia Tộc Họ Phạm"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Tiêu đề hiển thị trên thanh tab trình duyệt và kết quả tìm kiếm Google (khuyến nghị 50-60 ký tự).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Mô tả tóm tắt (Meta Description)
                    </label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Đoạn tóm tắt xuất hiện dưới tiêu đề trên Google (khuyến nghị 120-160 ký tự).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Từ khóa tìm kiếm (Meta Keywords)
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="gia phả, họ phạm, gia tộc họ phạm, phả hệ..."
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cấu hình Thumbnail Mạng Xã Hội */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Share2 className="w-4 h-4" />
                    <span>Ảnh Thumbnail Chia Sẻ MXH (Open Graph / Twitter Card)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOgImageUrl('https://cdn.upanhlaylink.com/i/NVk3RyLC.png')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                  >
                    Dùng ảnh mặc định của dòng họ
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Đường dẫn ảnh Thumbnail (URL ảnh tỷ lệ 1200x630px)
                  </label>
                  <input
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="https://cdn.upanhlaylink.com/i/NVk3RyLC.png"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Ảnh hiển thị nổi bật khi gửi liên kết qua Zalo, Facebook, Messenger, Telegram.
                  </p>
                </div>
              </div>

              {/* Nút lưu */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="submit"
                  disabled={seoSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {seoSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu Cấu Hình SEO & Thumbnail MXH</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
