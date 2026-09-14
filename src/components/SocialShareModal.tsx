import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Facebook,
  Send,
  Sparkles,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { ClanInfo } from '../types.ts';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: ClanInfo | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  clan,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedOgCode, setCopiedOgCode] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://ais-pre-yz2htyrxbnx6vsbzo3hwif-897097150605.asia-southeast1.run.app';
  const shareTitle = clan?.seo_title || clan?.name || 'Gia Tộc Họ Phạm - Cổng Thông Tin Gia Phả Điện Tử';
  const shareDescription = clan?.seo_description || clan?.description || 'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ cây tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.';
  const thumbnailUrl = clan?.og_image_url || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyOgTags = () => {
    const ogHtml = `<!-- Thẻ SEO & Open Graph Gia Tộc Họ Phạm -->
<meta property="og:title" content="${shareTitle}" />
<meta property="og:description" content="${shareDescription}" />
<meta property="og:image" content="${thumbnailUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${currentUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${thumbnailUrl}" />`;

    navigator.clipboard.writeText(ogHtml).then(() => {
      setCopiedOgCode(true);
      setTimeout(() => setCopiedOgCode(false), 2500);
    });
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500,menubar=no,toolbar=no');
  };

  const handleShareZalo = () => {
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(currentUrl)}`;
    window.open(zaloUrl, '_blank', 'width=600,height=550,menubar=no,toolbar=no');
  };

  const handleShareTelegram = () => {
    const teleUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle + ' - Kính mời con cháu dòng họ cùng xem phả ký gia tộc')}`;
    window.open(teleUrl, '_blank', 'width=600,height=500');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-xl bg-stone-900 border border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950/90 border border-amber-700/60 text-amber-400 flex items-center justify-center shadow-inner">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-1.5">
                  <span>Chia Sẻ Cổng Gia Phả Lên Mạng Xã Hội</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-stone-400">
                  Ảnh bìa Thumbnail 1200x630 chuẩn Facebook, Zalo, Twitter
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-300">
            {/* Thumbnail Preview Card (Mock Social Card) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <ImageIcon className="w-4 h-4" />
                  Ảnh Thumbnail hiển thị khi chia sẻ MXH
                </span>
                <a
                  href={thumbnailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>Mở ảnh gốc</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Social Preview Container (Facebook/Zalo style card) */}
              <div className="rounded-xl border border-stone-700/80 bg-stone-950 overflow-hidden shadow-lg group">
                <div className="relative aspect-[1200/630] w-full bg-stone-900 overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail Gia Tộc Họ Phạm"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-sm border border-amber-500/40 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-amber-400" />
                    <span>OG:IMAGE • 1200 × 630</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1 bg-stone-900/90 border-t border-stone-800">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90">
                    CỔNG GIA PHẢ ĐIỆN TỬ
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-stone-100 line-clamp-1">
                    {shareTitle}
                  </div>
                  <div className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {shareDescription}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Social Share Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-300 block">
                Chọn nền tảng chia sẻ nhanh:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Facebook className="w-4 h-4 text-blue-400" />
                  <span>Chia sẻ Facebook</span>
                </button>

                {/* Zalo */}
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/50 text-sky-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="w-4 h-4 rounded-full bg-sky-500 text-stone-950 font-extrabold text-[9px] flex items-center justify-center">
                    Z
                  </span>
                  <span>Gửi tin nhắn Zalo</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="px-3.5 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>Gửi Telegram</span>
                </button>
              </div>
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 block">
                Liên kết cổng gia phả:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-amber-500 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Copy Meta Tags snippet for developers */}
            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={handleCopyOgTags}
                className="w-full px-3 py-2 rounded-lg bg-stone-950/60 hover:bg-stone-950 border border-stone-800 text-[11px] text-stone-400 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedOgCode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Đã sao chép toàn bộ mã thẻ Open Graph HTML!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Sao chép mã thẻ Open Graph & Meta SEO (Dành cho webmaster)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
