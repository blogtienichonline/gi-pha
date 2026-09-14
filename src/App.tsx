/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { FamilyTree } from './components/FamilyTree.tsx';
import { MemberListView } from './components/MemberListView.tsx';
import { StatsView } from './components/StatsView.tsx';
import { MemberDetailModal } from './components/MemberDetailModal.tsx';
import { MemberFormModal } from './components/MemberFormModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { AuthPage } from './components/AuthPage.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { ApiDocsView } from './components/ApiDocsView.tsx';
import { FadeTransitionLoader } from './components/FadeTransitionLoader.tsx';
import { AdminConfigModal } from './components/AdminConfigModal.tsx';
import { SocialShareModal } from './components/SocialShareModal.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { ThemeWatermark } from './components/ThemeWatermark.tsx';
import { api } from './services/api.ts';
import { exportGenealogyPDF } from './services/pdfExport.ts';
import { ClanInfo, ClanStats, Member, MemberDetail, TreeNode, User } from './types.ts';
import { getClanTheme, applyThemeVariables } from './theme.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [treeRoots, setTreeRoots] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState<ClanStats | null>(null);

  const [currentView, setCurrentView] = useState<'tree' | 'list' | 'stats' | 'landing' | 'docs'>('tree');
  const [guestView, setGuestView] = useState<'landing' | 'auth'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Fade loading transition states
  const [isFadeLoading, setIsFadeLoading] = useState(false);
  const [fadeLoadingMessage, setFadeLoadingMessage] = useState('Đang mở cổng Gia Phả Họ Phạm...');
  const [fadeLoadingSubMessage, setFadeLoadingSubMessage] = useState('Ẩm Thủy Tư Nguyên • Vạn Đại Trường Tồn');

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [prefilledParentId, setPrefilledParentId] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState(false);
  const [adminConfigTab, setAdminConfigTab] = useState<'clan' | 'theme' | 'seo' | 'bulk' | 'users' | 'system' | 'mobile-api'>('clan');
  const [isShareOpen, setIsShareOpen] = useState(false);

  // App loading & error states
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reusable Fade Transition helper for smooth fade-in and fade-out
  const triggerFadeTransition = useCallback((
    action?: () => void,
    message: string = 'Đang mở cổng Gia Phả Họ Phạm...',
    subMessage: string = 'Ẩm Thủy Tư Nguyên • Vạn Đại Trường Tồn'
  ) => {
    setFadeLoadingMessage(message);
    setFadeLoadingSubMessage(subMessage);
    setIsFadeLoading(true);

    setTimeout(() => {
      if (action) {
        action();
      }
      setTimeout(() => {
        setIsFadeLoading(false);
      }, 400);
    }, 350);
  }, []);

  // Load all initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [currentUserData, clanData, treeData, statsData] = await Promise.all([
        api.getCurrentUser(),
        api.getClanInfo(),
        api.getTree(),
        api.getStats(),
      ]);

      setCurrentUser(currentUserData);
      setClan(clanData);
      setTreeRoots(treeData.roots);
      setMembers(treeData.flat);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading genealogy data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (clan) {
      const activeTheme = getClanTheme(clan);
      applyThemeVariables(activeTheme);

      if (typeof document !== 'undefined') {
        const title = clan.seo_title || clan.name || 'Remix Quản Lý Gia Phả';
        const desc = clan.seo_description || clan.description || 'Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF truyền thống.';
        const img = clan.og_image_url || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png';

        document.title = title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', desc);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', desc);
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', img);
        const ogImgSec = document.querySelector('meta[property="og:image:secure_url"]');
        if (ogImgSec) ogImgSec.setAttribute('content', img);
        const twTitle = document.querySelector('meta[name="twitter:title"]');
        if (twTitle) twTitle.setAttribute('content', title);
        const twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) twDesc.setAttribute('content', desc);
        const twImg = document.querySelector('meta[name="twitter:image"]');
        if (twImg) twImg.setAttribute('content', img);
      }
    }
  }, [clan]);

  // Roles check
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  // Member Selection (from search, tree node, or list)
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setHighlightId(id);
  };

  // Add Member
  const handleOpenAddMember = (parentId?: string) => {
    setEditingMember(null);
    setPrefilledParentId(parentId || null);
    setIsFormOpen(true);
  };

  // Edit Member
  const handleOpenEditMember = (member: Member | MemberDetail) => {
    setEditingMember(member);
    setPrefilledParentId(null);
    setIsFormOpen(true);
  };

  // Save Member (Add or Edit)
  const handleSaveMember = async (payload: Partial<Member>) => {
    if (editingMember && editingMember.id) {
      const res = await api.updateMember(editingMember.id, payload);
      if (!res.success) throw new Error(res.message || 'Lỗi khi cập nhật thành viên.');
      showToast('Đã cập nhật thông tin thành viên thành công!');
    } else {
      const res = await api.createMember(payload);
      if (!res.success) throw new Error(res.message || 'Lỗi khi thêm thành viên.');
      showToast('Đã thêm thành viên mới vào gia phả thành công!');
    }
    // Reload tree and members
    await loadData();
    setIsFormOpen(false);
    setEditingMember(null);
    setPrefilledParentId(null);
  };

  // Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!isAdmin) {
      alert('Chỉ quản trị viên mới có quyền xóa thành viên khỏi gia phả.');
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" khỏi gia phả? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await api.deleteMember(id);
      if (!res.success) {
        alert(res.message || 'Không thể xóa thành viên.');
        return;
      }
      showToast(`Đã xóa thành viên "${name}" khỏi gia phả.`);
      setSelectedMemberId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa thành viên.');
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!clan) return;
    try {
      showToast('Đang tạo tệp PDF Gia Phả với hoa văn in chìm và đầy đủ dấu tiếng Việt...');
      await exportGenealogyPDF(clan, members, stats);
      showToast('Đã tải tệp PDF Gia Phả thành công!');
    } catch (err) {
      console.error(err);
      alert('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  };

  // Logout
  const handleLogout = () => {
    triggerFadeTransition(
      () => {
        api.removeToken();
        setCurrentUser(null);
        setGuestView('landing');
        showToast('Đã đăng xuất an toàn. Kính chào con cháu Gia Tộc Họ Phạm.');
      },
      'Đang đăng xuất an toàn...',
      'Ẩm Thủy Tư Nguyên • Hẹn gặp lại con cháu Gia Tộc Họ Phạm'
    );
  };

  const handleAuthSuccess = (user: User) => {
    triggerFadeTransition(
      () => {
        setCurrentUser(user);
        setIsLoginOpen(false);
        setGuestView('landing');
        showToast(`Chào mừng ${user.full_name || user.username}! Bạn đã đăng nhập thành công.`);
        loadData();
      },
      'Đăng nhập thành công!',
      'Kính chúc con cháu Họ Phạm an khang thịnh vượng — Đang mở sơ đồ gia phả'
    );
  };

  const handleOpenLoginFromLanding = () => {
    triggerFadeTransition(
      () => {
        setAuthInitialMode('login');
        setGuestView('auth');
      },
      'Đang mở cổng Đăng Nhập...',
      'Kính chào con cháu Gia Tộc Họ Phạm'
    );
  };

  const handleOpenRegisterFromLanding = () => {
    triggerFadeTransition(
      () => {
        setAuthInitialMode('register');
        setGuestView('auth');
      },
      'Đang mở cổng Đăng Ký thành viên...',
      'Hoan nghênh con cháu đăng ký tham gia phả hệ'
    );
  };

  const handleTriggerFadePreview = () => {
    triggerFadeTransition(
      undefined,
      'Trải nghiệm hiệu ứng chuyển cảnh phả hệ',
      'Cội Nguồn Huyết Thống • Vạn Cổ Trường Tồn'
    );
  };

  const activeTheme = getClanTheme(clan);

  // If still loading initial state
  if (loading && !clan) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <FadeTransitionLoader
          isLoading={true}
          message="Đang tải dữ liệu gia phả dòng họ..."
          subMessage="Gia Tộc Họ Phạm • Ẩm Thủy Tư Nguyên"
        />
      </div>
    );
  }

  // If not logged in, display Landing Page by default, or AuthPage when requested
  if (!currentUser) {
    return (
      <div className="relative min-h-screen">
        <FadeTransitionLoader
          isLoading={isFadeLoading}
          message={fadeLoadingMessage}
          subMessage={fadeLoadingSubMessage}
        />

        {toastMessage && (
          <div className="fixed top-6 right-4 z-50 px-4 py-2.5 bg-stone-900 border border-amber-600/80 text-amber-200 text-xs font-semibold rounded-xl shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {toastMessage}
          </div>
        )}

        {guestView === 'landing' ? (
          <LandingPage
            clan={clan}
            onOpenLogin={handleOpenLoginFromLanding}
            onOpenRegister={handleOpenRegisterFromLanding}
            onTriggerFadePreview={handleTriggerFadePreview}
            onOpenShare={() => setIsShareOpen(true)}
          />
        ) : (
          <AuthPage
            clan={clan}
            onAuthSuccess={handleAuthSuccess}
            initialMode={authInitialMode}
            onBackToLanding={() => {
              triggerFadeTransition(
                () => setGuestView('landing'),
                'Đang quay lại trang giới thiệu...',
                'Gia Tộc Họ Phạm Đại Tôn'
              );
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${activeTheme.bg.bodyClass} flex flex-col selection:bg-amber-800 selection:text-amber-100 relative transition-colors duration-300`}>
      {/* Global Fade In / Fade Out Transition Loader */}
      <FadeTransitionLoader
        isLoading={isFadeLoading}
        message={fadeLoadingMessage}
        subMessage={fadeLoadingSubMessage}
      />

      {/* Traditional Watermark Motif */}
      <ThemeWatermark pattern={activeTheme.patternKey} isDark={activeTheme.bg.isDark} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 bg-stone-900 border border-amber-600/80 text-amber-200 text-xs font-semibold rounded-xl shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        clan={clan}
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={(view) => {
          triggerFadeTransition(
            () => setCurrentView(view),
            view === 'landing'
              ? 'Đang mở Văn Tự Dòng Tộc...'
              : view === 'docs'
              ? 'Đang mở Tài Liệu REST API & Sandbox...'
              : 'Đang chuyển đổi góc nhìn phả hệ...',
            'Gia Tộc Họ Phạm'
          );
        }}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)}
        onOpenAddMember={() => handleOpenAddMember()}
        onExportPDF={handleExportPDF}
        onOpenShare={() => setIsShareOpen(true)}
        members={members}
        onSelectMember={handleSelectMember}
        totalGenerations={stats?.totalGenerations || 1}
      />

      {/* Main Content View */}
      <main className="flex-1 relative flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-400 font-medium tracking-wider">
              ĐANG TẢI DỮ LIỆU GIA PHẢ DÒNG HỌ...
            </p>
          </div>
        ) : (
          <>
            {/* View 1: Tree Hierarchy View */}
            {currentView === 'tree' && (
              <FamilyTree
                treeRoots={treeRoots}
                members={members}
                onSelectMember={handleSelectMember}
                onAddChild={(parentId) => handleOpenAddMember(parentId)}
                canEdit={canEdit}
                highlightId={highlightId}
              />
            )}

            {/* View 2: Member List View */}
            {currentView === 'list' && (
              <MemberListView
                members={members}
                onSelectMember={handleSelectMember}
                onEditMember={handleOpenEditMember}
                onDeleteMember={handleDeleteMember}
                onAddMember={() => handleOpenAddMember()}
                canEdit={canEdit}
                isAdmin={isAdmin}
                onOpenBulkManager={() => {
                  setAdminConfigTab('bulk');
                  setIsAdminConfigOpen(true);
                }}
                onRefreshData={loadData}
                showToast={showToast}
              />
            )}

            {/* View 3: Statistics & Demographics View */}
            {currentView === 'stats' && (
              <StatsView clan={clan} stats={stats} members={members} />
            )}

            {/* View 4: Landing Page / Clan History & Guidelines View */}
            {currentView === 'landing' && (
              <LandingPage
                clan={clan}
                onOpenLogin={() => {
                  triggerFadeTransition(
                    () => setCurrentView('tree'),
                    'Đang trở lại sơ đồ cây...',
                    'Gia Tộc Họ Phạm'
                  );
                }}
                onOpenRegister={() => {
                  triggerFadeTransition(
                    () => setCurrentView('tree'),
                    'Đang trở lại sơ đồ cây...',
                    'Gia Tộc Họ Phạm'
                  );
                }}
                onTriggerFadePreview={handleTriggerFadePreview}
              />
            )}

            {/* View 5: Detailed REST API Docs & Interactive Playground (Admin only) */}
            {currentView === 'docs' && currentUser?.role === 'admin' && (
              <ApiDocsView currentUser={currentUser} clan={clan} />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)}
        onOpenAddMember={() => handleOpenAddMember()}
        totalMembers={members.length}
      />

      {/* Member Details Drawer/Modal */}
      {selectedMemberId && (
        <MemberDetailModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          onSelectMember={handleSelectMember}
          onEditMember={(member) => {
            setSelectedMemberId(null);
            handleOpenEditMember(member);
          }}
          onAddChild={(parentId) => {
            setSelectedMemberId(null);
            handleOpenAddMember(parentId);
          }}
          onDeleteMember={handleDeleteMember}
          canEdit={canEdit}
          isAdmin={isAdmin}
        />
      )}

      {/* Member Form Modal (Add / Edit) */}
      <MemberFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(null);
          setPrefilledParentId(null);
        }}
        onSave={handleSaveMember}
        initialData={editingMember}
        existingMembers={members}
        prefilledParentId={prefilledParentId}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Đăng nhập thành công! Chào mừng ${user.full_name}.`);
        }}
      />

      {/* Admin Config Modal */}
      <AdminConfigModal
        isOpen={isAdminConfigOpen}
        onClose={() => setIsAdminConfigOpen(false)}
        clan={clan}
        onClanUpdated={(updated) => setClan(updated)}
        members={members}
        onRefreshData={loadData}
        initialTab={adminConfigTab}
        onOpenDocs={() => {
          setIsAdminConfigOpen(false);
          triggerFadeTransition(
            () => setCurrentView('docs'),
            'Đang mở Tài Liệu REST API & Sandbox...',
            'Gia Tộc Họ Phạm'
          );
        }}
      />

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        clan={clan}
      />
    </div>
  );
}

