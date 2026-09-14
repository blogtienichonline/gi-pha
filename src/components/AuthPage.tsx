import React, { useState } from 'react';
import { LogIn, UserPlus, Key, User, Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, Users, Award, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.ts';
import { ClanInfo, User as UserType } from '../types.ts';
import { getClanTheme } from '../theme.ts';

interface AuthPageProps {
  clan: ClanInfo | null;
  onAuthSuccess: (user: UserType) => void;
  initialMode?: 'login' | 'register';
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ clan, onAuthSuccess, initialMode = 'login', onBackToLanding }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const theme = getClanTheme(clan);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.login(loginUsername.trim(), loginPassword.trim());
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setError(res.message || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối tới máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = regUsername.trim();
    const cleanPass = regPassword.trim();
    const cleanConfirm = regConfirmPassword.trim();

    if (!cleanUser || !cleanPass) {
      setError('Vui lòng nhập tên tài khoản và mật khẩu để tạo tài khoản.');
      return;
    }

    if (cleanUser.length < 3) {
      setError('Tên tài khoản cần có tối thiểu 3 ký tự.');
      return;
    }

    if (cleanPass.length < 3) {
      setError('Mật khẩu cần có tối thiểu 3 ký tự.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.register(cleanUser, cleanPass, regFullName.trim() || undefined);
      if (res.success && res.user) {
        setSuccessMsg('Đăng ký thành công! Đang chuyển hướng vào xem gia phả...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 600);
      } else {
        setError(res.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`min-h-screen ${theme.bg.bodyClass} flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative select-none`}>
      {/* Decorative Traditional Watermark Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber-600/30 flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-amber-600/20 flex items-center justify-center">
            <div className="w-[300px] h-[300px] rounded-full border border-amber-600/20" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Back to Landing Page link */}
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 bg-stone-900/80 hover:bg-stone-800 rounded-lg border border-amber-900/40 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Cổng Giới Thiệu Họ Phạm</span>
            </button>
          </div>
        )}

        {/* Clan Brand Header */}
        <div className="text-center space-y-3">
          {/* Logo & Emblem */}
          <div className="inline-flex items-center justify-center">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 ${theme.logoShape} bg-gradient-to-br ${theme.color.gradient} p-1 shadow-2xl ring-2 ring-amber-500/40 flex items-center justify-center overflow-hidden`}
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
                  className={`w-full h-full ${theme.bg.isDark ? 'bg-stone-950/90' : 'bg-white/95'} ${theme.logoShape} flex items-center justify-center font-bold text-2xl sm:text-3xl ${theme.color.textAccent}`}
                >
                  {theme.logoText || '氏'}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-500/90 mb-1">
              ẨM THỦY TƯ NGUYÊN • VẠN ĐẠI TRƯỜNG TỒN
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold tracking-wide ${theme.bg.isDark ? theme.color.textTitle : 'text-stone-900'}`}>
              {clan?.name || 'Gia Phả Đại Tộc'}
            </h1>
            {clan?.ancestor_name && (
              <p className={`text-xs mt-0.5 ${theme.bg.textMuted}`}>
                Thủy Tổ: Cụ {clan.ancestor_name}
              </p>
            )}
          </div>
        </div>

        {/* Main Auth Card */}
        <div
          id="auth-container-card"
          className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
            theme.bg.isDark
              ? 'bg-stone-900/95 border-stone-750 border-stone-800'
              : 'bg-white/95 border-stone-200 shadow-stone-300/50'
          }`}
        >
          {/* Dual Tabs: Đăng Nhập & Đăng Ký */}
          <div className="grid grid-cols-2 border-b border-stone-800/80 bg-stone-950/50 p-1.5 gap-1">
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Mới</span>
            </button>
          </div>

          <div className="p-5 sm:p-7 space-y-4">
            {/* Banner info */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200/90 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {mode === 'login' ? (
                  <span>
                    Vui lòng đăng nhập để xem sơ đồ gia phả, thế hệ trực hệ và danh sách thành viên dòng họ.
                  </span>
                ) : (
                  <span>
                    <strong>Không cần xác thực phức tạp:</strong> Chỉ cần nhập tài khoản & mật khẩu, bạn có thể tạo tài khoản và vào xem toàn bộ gia phả ngay lập tức.
                  </span>
                )}
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Mode 1: LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Tài khoản <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input-auth-login-username"
                      type="text"
                      required
                      autoFocus
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Nhập tên tài khoản..."
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Mật khẩu <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input-auth-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-auth-login-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập Vào Xem Gia Phả'}</span>
                  </button>
                </div>

                {/* Switch to Register */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-stone-400">
                    Chưa có tài khoản xem gia phả?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError(null);
                      }}
                      className="text-amber-400 font-semibold hover:underline ml-1"
                    >
                      Đăng ký mới ngay
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Form Mode 2: REGISTER */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Tên tài khoản đăng ký <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input-auth-register-username"
                      type="text"
                      required
                      autoFocus
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="Ví dụ: conchau_01, vanan..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Viết liền, không dấu, tối thiểu 3 ký tự.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Họ và tên của bạn <span className="text-stone-500 font-normal">(tùy chọn hiển thị)</span>
                  </label>
                  <input
                    id="input-auth-register-fullname"
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An, Hoàng Thị Mai..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Mật khẩu <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input-auth-register-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 3 ký tự..."
                      className="w-full pl-9 pr-10 py-2 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nhập lại mật khẩu <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input-auth-register-confirm"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-auth-register-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Đang Tạo Tài Khoản...' : 'Đăng Ký & Vào Xem Gia Phả'}</span>
                  </button>
                </div>

                {/* Switch to Login */}
                <div className="pt-2 text-center">
                  <p className="text-xs text-stone-400">
                    Đã có tài khoản trước đó?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                      }}
                      className="text-amber-400 font-semibold hover:underline ml-1"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Feature summary pills at bottom */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-stone-400">
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 flex flex-col items-center gap-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Phả Hệ Trực Hệ</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Danh Sách Đinh & Nữ</span>
          </div>
          <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800/80 flex flex-col items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Xuất PDF Cổ Truyền</span>
          </div>
        </div>
      </div>
    </div>
  );
};
