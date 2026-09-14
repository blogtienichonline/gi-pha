import React from 'react';
import { motion } from 'motion/react';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  BookOpen,
  Network,
  Users,
  FileDown,
  Calendar,
  Sparkles,
  ChevronRight,
  Landmark,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Feather,
  CheckCircle2,
  Lock,
  Layers,
  Share2,
  Globe,
  Facebook,
} from 'lucide-react';
import { ClanInfo } from '../types.ts';
import { getClanTheme } from '../theme.ts';

interface LandingPageProps {
  clan: ClanInfo | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onTriggerFadePreview?: () => void;
  onOpenShare?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  clan,
  onOpenLogin,
  onOpenRegister,
  onTriggerFadePreview,
  onOpenShare,
}) => {
  const theme = getClanTheme(clan);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featureItems = [
    {
      icon: Network,
      title: '1. Sơ Đồ Cây Phả Hệ Trực Hệ Tương Tác',
      desc: 'Tái hiện sinh động mạch nguồn huyết thống từ Thủy Tổ đến các đời hậu duệ. Hỗ trợ thu phóng mượt mà, phân rõ từng thế hệ (Đời 1, Đời 2, Đời 3...), phân nhánh theo cành, chi, phái, thứ bậc và hôn phối rành mạch.',
      tag: 'Định vị cành nhánh tức thì',
    },
    {
      icon: BookOpen,
      title: '2. Phả Ký Tiền Nhân & Hành Trạng Tổ Phụ',
      desc: 'Lưu giữ chi tiết tiểu sử, chức phẩm, công đức, năm sinh năm mất (song hành Âm - Dương lịch), vị trí an táng mồ mả của các bậc tiền nhân, đảm bảo ký ức dòng tộc không bị mai một.',
      tag: 'Hồ sơ tiền nhân trang trọng',
    },
    {
      icon: Users,
      title: '3. Sổ Vàng Dòng Tộc & Tra Cứu Đinh - Nữ',
      desc: 'Bảng danh sách toàn diện tra cứu tức thì theo họ tên, thế hệ, chi nhánh, phân loại con trai (nhân đinh), con gái, dâu, rể. Tự động thống kê nhân khẩu và sự hưng thịnh của dòng tộc.',
      tag: 'Lọc tìm kiếm nhanh & chính xác',
    },
    {
      icon: ShieldCheck,
      title: '4. Bảo Mật Huyết Thống Cấp Dòng Họ',
      desc: 'Phân quyền truy cập 3 cấp: Quản trị viên (Admin), Ban biên tập (Editor), Thành viên xem (Viewer). Thông tin nhạy cảm của người đang sống được bảo vệ an toàn, chỉ người trong họ mới được cấp phép xem.',
      tag: 'Tuyệt đối an toàn thông tin',
    },
    {
      icon: FileDown,
      title: '5. Xuất Bản Gia Phả PDF Cổ Truyền',
      desc: 'Tự động kết xuất cuốn phả ký hoàn chỉnh sang định dạng PDF chuẩn in ấn, tích hợp hoa văn Trống Đồng Đông Sơn, hoa sen thủy ấn, sẵn sàng in đóng tập bìa da trang trọng dâng tại Từ Đường.',
      tag: 'Đầy đủ dấu tiếng Việt & Thủy ấn',
    },
    {
      icon: Calendar,
      title: '6. Lịch Tế Tự & Kỵ Nhật Dòng Tộc',
      desc: 'Ghi nhớ chính xác ngày giỗ tổ, ngày kỵ giỗ cụ ông, cụ bà theo Âm lịch, lịch tế xuân thu tại Từ Đường; giúp con cháu dù ở xa Tổ quốc vẫn chủ động sắp xếp thời gian phụng hiến báo hiếu.',
      tag: 'Âm lịch & Giỗ chạp dòng họ',
    },
  ];

  const fourPrecepts = [
    {
      numeral: 'I',
      title: 'Hiếu Kính Tiên Tổ',
      desc: 'Chăm sóc mồ mả, xuân thu nhị kỳ tề tựu nơi Từ Đường dâng nén tâm hương tưởng niệm tiền nhân.',
    },
    {
      numeral: 'II',
      title: 'Gia Đạo Hòa Thuận',
      desc: 'Huynh đệ tương thân, chị em tương kính, đùm bọc người hoạn nạn, nâng đỡ con cháu bần hàn.',
    },
    {
      numeral: 'III',
      title: 'Khuyến Học Khuyến Tài',
      desc: 'Nuôi dưỡng chí lớn, dùi mài kinh sử, rèn đức luyện tài để rạng danh tổ tông họ Phạm.',
    },
    {
      numeral: 'IV',
      title: 'Bảo Tồn Phả Ký',
      desc: 'Đời đời tiếp nối ghi chép sinh - tử - thế thứ để mạch nguồn huyết thống không bao giờ đứt đoạn.',
    },
  ];

  return (
    <div className={`min-h-screen ${theme.bg.bodyClass} text-stone-100 selection:bg-amber-800 selection:text-amber-100 relative overflow-hidden flex flex-col font-normal`}>
      {/* Dynamic Ambient Glow Spheres with subtle motion */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [-10, 15, -10],
          y: [-10, 20, -10],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-3xl pointer-events-none -z-10"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
          x: [15, -10, 15],
          y: [20, -15, 20],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 right-[-100px] w-[600px] h-[600px] bg-amber-700/15 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* Decorative Rotating Sacred Clan Watermark Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] sm:w-[1200px] sm:h-[1200px] rounded-full border border-amber-500/10 pointer-events-none flex items-center justify-center -z-10"
      >
        <div className="w-3/4 h-3/4 rounded-full border border-dashed border-amber-500/15 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full border border-amber-600/20" />
        </div>
      </motion.div>

      {/* Top Traditional Header / Navigation */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-40 backdrop-blur-md bg-stone-950/90 border-b border-amber-900/40 px-6 sm:px-10 lg:px-12 py-4 sm:py-5 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5 sm:gap-4 shrink-0 md:w-[260px]">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-xl shadow-amber-950/70 ring-1 ring-amber-400/50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
            >
              <div className="w-full h-full rounded-[14px] bg-stone-950/95 flex items-center justify-center">
                <span className="font-serif font-bold text-2xl sm:text-3xl text-amber-300 drop-shadow">
                  范
                </span>
              </div>
            </motion.div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-[13px] font-bold tracking-[0.25em] text-amber-400 uppercase">
                  PHẠM TỘC ĐẠI TÔN
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-stone-100 tracking-wide">
                {clan?.name || 'Gia Tộc Họ Phạm'}
              </h1>
            </div>
          </div>

          {/* Nav links - centered on desktop, hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center md:w-auto">
            <nav className="flex items-center flex-wrap justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-stone-900/70 border border-stone-800/80 backdrop-blur-sm shadow-inner shadow-black/30">
              <button
                onClick={() => scrollToSection('loi-nguyen')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Lời Tựa Cội Nguồn
              </button>
              <button
                onClick={() => scrollToSection('tinh-nang')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Tính Năng Phả Hệ
              </button>
              <button
                onClick={() => scrollToSection('bao-mat')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Bảo Mật Tộc Hệ
              </button>
              <button
                onClick={() => scrollToSection('tu-duong')}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Từ Đường & Giỗ Tổ
              </button>
            </nav>
          </div>

          {/* Balanced spacer for desktop symmetry */}
          <div className="hidden md:block shrink-0 md:w-[260px] pointer-events-none" aria-hidden="true" />
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 text-center max-w-5xl mx-auto">
        {/* Traditional Hoành Phi Parallel Sentences Banner with Shimmer & Entrance Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="inline-block mb-6"
        >
          <div className="relative group px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border border-amber-600/50 text-amber-300 text-xs sm:text-sm font-medium tracking-wider shadow-inner shadow-amber-900/40 flex items-center justify-center gap-2 overflow-hidden">
            {/* Ambient Shimmer ray */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent skew-x-12 pointer-events-none"
            />
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-semibold">木 出 千 枝 由 有 本 • 水 流 萬 派 總 同 源</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          </div>
          <p className="text-[11px] sm:text-xs text-amber-400/90 font-medium italic mt-1.5">
            "Cây sinh ngàn nhánh do từ cội — Nước chảy muôn phương bởi một nguồn"
          </p>
        </motion.div>

        {/* Hero Main Heading with Animation */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-100 leading-tight sm:leading-snug max-w-4xl mx-auto mb-6"
        >
          CỔNG THÔNG TIN GIA PHẢ ĐIỆN TỬ <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
            GIA TỘC HỌ PHẠM ĐẠI TÔN
          </span>
        </motion.h2>

        {/* Solemn Literary Introductory Prose */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-3xl mx-auto mb-8 text-justify sm:text-center"
        >
          Dòng họ Phạm ngàn năm văn hiến, rạng danh bờ cõi, con cháu kế nghiệp tiên nhân giữ vẹn đạo cương thường.
          Hệ thống Gia Phả Số được phụng lập nhằm lưu truyền vĩnh cửu công đức cao dày của Thủy Tổ và chư vị tiền hiền;
          kết nối muôn cành vạn nhánh con cháu họ Phạm dẫu khắp bốn bể năm châu vẫn đồng quy bái vọng cội nguồn thiêng liêng.
        </motion.p>

        {/* CTA Button Group with Motion effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 30px rgba(217, 119, 6, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            id="hero-cta-login"
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
            <span>Đăng Nhập Khám Phá Gia Phả</span>
            <ChevronRight className="w-4 h-4 text-amber-200 transition-transform group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            id="hero-cta-register"
            type="button"
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white font-semibold text-sm sm:text-base border border-stone-700 hover:border-amber-600/60 shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform group-hover:scale-110" />
            <span>Đăng Ký Tài Khoản Con Cháu</span>
          </motion.button>
        </motion.div>

        {/* Important Privacy Notice Banner: No tree data exposed before login */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900/70 to-amber-950/40 border border-amber-700/50 text-amber-200/90 text-xs sm:text-sm flex items-start sm:items-center gap-3.5 text-left shadow-lg"
        >
          <div className="relative shrink-0 mt-0.5 sm:mt-0">
            <span className="absolute -inset-1 rounded-full bg-amber-500/30 animate-ping" />
            <ShieldAlert className="relative w-5 h-5 text-amber-400" />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300">Bảo mật dòng tộc nghiêm ngặt:</span>{' '}
            Toàn bộ danh tính thế hệ, hành trạng cá nhân và sơ đồ cây huyết thống được giữ kín tuyệt đối.
            Con cháu chỉ cần tạo tài khoản (không cần xác thực phức tạp) để đăng nhập và tra cứu đầy đủ.
          </div>
        </motion.div>
      </section>

      {/* Section: Lời Tựa Nguồn Cội & Văn Tự Gia Phong */}
      <section id="loi-nguyen" className="py-14 sm:py-24 px-4 sm:px-8 border-t border-b border-stone-800/80 bg-stone-950/60 relative">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Feather className="w-3.5 h-3.5" />
              <span>VĂN TỰ GIA PHONG TRUYỀN ĐỜI</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-stone-100">
              Công Đức Tổ Tông Thiên Niên Thịnh — Tử Tôn Hậu Duệ Vạn Đại Xương
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto font-normal">
              Trích văn tế phụng lập phả hệ Gia Tộc Họ Phạm
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Column 1: Lời ngỏ cổ kính */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -4, borderColor: 'rgba(217, 119, 6, 0.5)' }}
              className="p-6 sm:p-8 rounded-2xl bg-stone-900/70 border border-stone-800 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div className="space-y-3 text-stone-300 text-xs sm:text-sm leading-relaxed text-justify font-normal">
                <p>
                  <strong className="text-amber-300 font-bold">Kính cáo Tiên Tổ:</strong> Người ta sinh ra ở đời, ai cũng có tổ có tông, như cây ngàn nhánh nương nhờ cội rễ, như nước vạn dòng khởi phát tự non cao.
                  Tổ tiên ta trải bao phong sương gian khó, mở cõi khai hoang, bồi đắp đức lành, dựng nên cơ nghiệp rạng rỡ lưu truyền cho con cháu đời sau.
                </p>
                <p>
                  Trải qua biến thiên dâu bể, con cháu họ Phạm có người ở lại quê hương canh giữ từ đường phụng thờ tiên tổ, có người dong buồm viễn xứ lập nghiệp muôn phương.
                  Nếu không có cuốn Phả Ký ghi chép rành mạch ngọn ngành, ắt thế thứ dễ mờ phai, tình thân dễ nhạt nhòa theo năm tháng.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-800 text-[11px] text-amber-400/90 font-medium italic">
                — Ban Trị Sự Hội Đồng Gia Tộc Họ Phạm cẩn chí
              </div>
            </motion.div>

            {/* Column 2: Tứ điều gia huấn */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -4, borderColor: 'rgba(217, 119, 6, 0.6)' }}
              className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-stone-900/85 to-amber-950/25 border border-amber-900/40 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <h4 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Bốn Điều Gia Huấn Cốt Lõi Của Dòng Họ Phạm</span>
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-stone-300 font-normal">
                {fourPrecepts.map((precept) => (
                  <li key={precept.numeral} className="flex items-start gap-2.5 group">
                    <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800/80 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-800 group-hover:text-amber-100 transition-colors">
                      {precept.numeral}
                    </span>
                    <span>
                      <strong className="text-stone-100 font-semibold">{precept.title}:</strong> {precept.desc}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] text-amber-400/80 font-medium italic">
                Ẩm Thủy Tư Nguyên — Vạn Đại Trường Tồn
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Chi Tiết Tính Năng Của Cổng Gia Phả Số */}
      <section id="tinh-nang" className="py-14 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto w-full relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CÔNG NGHỆ HIỆN ĐẠI • BẢO TỒN VĂN HÓA CỔ TRUYỀN</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-100">
            Hệ Thống Tính Năng Toàn Diện Của Gia Phả Điện Tử
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto font-normal">
            Được kiến tạo đặc biệt dành riêng cho dòng họ, kết hợp tinh hoa mỹ thuật cổ truyền và giải pháp số hóa phả hệ tân tiến.
          </p>
        </motion.div>

        {/* Grid of 6 Detailed Features with Motion Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-6 rounded-2xl bg-stone-900/75 border border-stone-800 hover:border-amber-600/60 transition-all duration-300 group flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                {/* Subtle card glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />

                <div className="space-y-3 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-stone-100 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-amber-400/90 font-medium flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                  <span>{item.tag}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Section: Quy Định Tiếp Cận & Quyền Riêng Tư Của Dòng Họ */}
      <section id="bao-mat" className="py-14 sm:py-24 px-4 sm:px-8 border-t border-stone-800/80 bg-stone-950/80 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-stone-900/90 via-stone-950 to-stone-950 border border-amber-800/50 p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden"
        >
          {/* Pulsing Radar Ring Behind Shield */}
          <div className="relative w-16 h-16 mx-auto">
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-sm"
            />
            <div className="relative w-16 h-16 rounded-2xl bg-amber-950/90 border border-amber-600/60 text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              QUY CHUẨN BẢO MẬT GIA PHẢ
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-100">
              Vì Sao Cần Đăng Nhập Trước Khi Xem Phả Đồ?
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed text-justify sm:text-center max-w-2xl mx-auto">
            Gia phả là bảo vật thiêng liêng, chứa đựng thông tin đời tư, danh bạ liên lạc, mộ phần và thế thứ của toàn bộ con cháu họ Phạm.
            Để tôn trọng đạo phụng tông và bảo vệ quyền riêng tư tuyệt đối cho các thành viên còn sống,
            hệ thống tuân thủ nguyên tắc: <strong className="text-amber-300 font-semibold">Không công khai dữ liệu nội bộ ra ngoài mạng Internet</strong> khi chưa xác định danh phận thành viên.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/60 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Đăng Nhập Vào Xem Gia Phả</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm border border-stone-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Đăng Ký Tài Khoản Mới (Tức thì)</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Section: Từ Đường & Ngày Giỗ Tổ */}
      <section id="tu-duong" className="py-14 sm:py-24 px-4 sm:px-8 border-t border-stone-800/80 bg-stone-900/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Landmark className="w-4 h-4" />
              <span>NƠI AN TỌA & NGÀY KỴ TẾ TỰ</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-extrabold text-stone-100">
              Từ Đường Dòng Họ Phạm & Ngày Giỗ Tổ Truyền Thống
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(217, 119, 6, 0.5)' }}
              className="p-6 rounded-2xl bg-stone-900/85 border border-stone-800 space-y-2 shadow-xl transition-all"
            >
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Từ Đường Dòng Họ
              </span>
              <p className="text-sm font-semibold text-stone-200">
                {clan?.temple_address || 'Từ Đường Dòng Họ Phạm, Thôn Đông, Đông Ngạc, Bắc Từ Liêm, Hà Nội'}
              </p>
              <p className="text-xs text-stone-400 font-normal">
                Nguyên quán: {clan?.origin || 'Làng Cổ Đông Ngạc, Hà Nội'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4, borderColor: 'rgba(217, 119, 6, 0.5)' }}
              className="p-6 rounded-2xl bg-stone-900/85 border border-stone-800 space-y-2 shadow-xl transition-all"
            >
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Ngày Giỗ Tổ Hàng Năm
              </span>
              <p className="text-sm font-bold text-amber-300">
                {clan?.anniversary_lunar || 'Ngày 16 tháng Giêng (Âm lịch)'}
              </p>
              <p className="text-xs text-stone-400 font-normal">
                Kính mời toàn thể con cháu nội ngoại bốn phương tề tựu dâng hương.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Sharing & Promotion Section */}
      <section id="chia-se-mxh" className="py-14 sm:py-20 px-4 sm:px-8 border-t border-stone-800 bg-gradient-to-b from-stone-950 via-stone-900/60 to-stone-950">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="space-y-2.5"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/70 border border-amber-600/40 text-amber-300 text-xs font-semibold tracking-wider shadow-inner">
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>LAN TỎA NGUỒN CỘI • KẾT NỐI ĐỒNG TỘC</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-100">
              Chia Sẻ Cổng Gia Phả Lên Mạng Xã Hội
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Gửi liên kết Cổng Gia Phả đến con cháu nội ngoại trên toàn cầu qua Facebook, Zalo để mọi thành viên cùng hướng về cội nguồn tiên tổ với hình ảnh đại diện trang trọng.
            </p>
          </motion.div>

          {/* Social Card Preview with Official Thumbnail */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto rounded-2xl bg-stone-900 border border-amber-600/40 shadow-2xl overflow-hidden text-left"
          >
            <div className="relative aspect-[1200/630] w-full bg-stone-950 overflow-hidden group">
              <img
                src={clan?.og_image_url || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png'}
                alt="Thumbnail Gia Tộc Họ Phạm"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="p-5 sm:p-6 bg-stone-900 space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {clan?.name || 'Gia Tộc Họ Phạm Đại Tôn'} • CỔNG GIA PHẢ ĐIỆN TỬ
                </div>
                <h4 className="text-base sm:text-lg font-bold text-stone-100">
                  {clan?.seo_title || clan?.name || 'Remix Quản Lý Gia Phả - Gia Tộc Họ Phạm'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 line-clamp-2 leading-relaxed">
                  {clan?.seo_description || clan?.description || 'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=500');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Chia sẻ Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=550');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-sky-600 font-extrabold text-[9px] flex items-center justify-center">
                    Z
                  </span>
                  <span>Gửi Zalo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenShare) {
                      onOpenShare();
                    } else {
                      const url = typeof window !== 'undefined' ? window.location.href : '';
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-amber-700/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tùy chọn chia sẻ & sao chép</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Traditional Footer */}
      <footer className="mt-auto border-t border-stone-800 bg-stone-950 py-8 px-4 sm:px-8 text-center text-xs text-stone-400 space-y-3 font-normal">
        <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm tracking-wide">
          <span>范</span>
          <span>GIA TỘC HỌ PHẠM ĐẠI TÔN</span>
          <span>范</span>
        </div>
        <p className="text-stone-500 max-w-xl mx-auto italic font-normal">
          "Trăm năm cội rễ bền lâu — Nghìn thu con cháu trọn câu nghĩa tình"
        </p>
        <div className="pt-2 text-[11px] text-stone-600 font-normal">
          Cổng Thông Tin Gia Phả Điện Tử • Phục vụ công đức bảo tồn huyết thống dòng họ
        </div>
      </footer>
    </div>
  );
};
