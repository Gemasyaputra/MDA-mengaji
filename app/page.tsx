'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import LoginPage from '@/components/pages/LoginPage';
import DashboardPage from '@/components/pages/DashboardPage';
import SantriManagePage from '@/components/pages/SantriManagePage';
import SantriDetailPage from '@/components/pages/SantriDetailPage';
import InputIqroPage from '@/components/pages/InputIqroPage';
import InputHafalnDoa from '@/components/pages/InputHafalnDoa';
import PresensiPage from '@/components/pages/PresensiPage';
import PresensiDetailPage from '@/components/pages/PresensiDetailPage';
import KabarPage from '@/components/pages/KabarPage';
import KabarDetailPage from "@/components/pages/KabarDetailPage";
import ParentViewPage from '@/components/pages/ParentViewPage';
import StudyGroupManagePage from '@/components/pages/StudyGroupManagePage';
import ManageTeachersPage from '@/components/pages/ManageTeachersPage';
import MasterHafalanPage from '@/components/pages/MasterHafalanPage';
import SantriHistoryPage from '@/components/pages/SantriHistoryPage';
import LandingPage from '@/components/pages/LandingPage';
import ActivityLogPage from '@/components/pages/ActivityLogPage';
/* import Toast from '@/components/Toast'; // REMOVED */
import { toast } from 'sonner';
import { User, UserRole } from '@/types';
import { useSession, signOut } from 'next-auth/react';


export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('error')) return 'login';
      // Restore last page from sessionStorage (persists across F5 refresh)
      const saved = sessionStorage.getItem('mda_current_page');
      if (saved && !['landing', 'login'].includes(saved)) return saved;
    }
    return 'landing';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mda_history_stack');
      try {
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const { data: session } = useSession();

  useEffect(() => {
    // Jika user sudah memiliki sesi (baru login SSO atau sudah login sebelumnya),
    // otomatis arahkan langsung ke dashboard sesuai rolenya jika ia berada di landing atau login
    if (session?.user && !currentUser) {
      const u = session.user as any;
      if (u.role) {
        const role = u.role as UserRole;
        const user: User = { id: parseInt(u.id), name: u.name || 'User', role };
        setCurrentRole(role);
        setCurrentUser(user);
        // Only redirect to dashboard if still on unauthenticated pages
        if (currentPage === 'login' || currentPage === 'landing') {
          setCurrentPage('dashboard');
        }
        // else: currentPage was restored from sessionStorage — keep it
      }
    }
  }, [session, currentUser]);

  const handleLogin = (role: UserRole, user?: User) => {
    setCurrentRole(role);
    if (user) {
      setCurrentUser(user);
    } else {
      // Default fallback if no user object provided (for backward compatibility if needed)
      setCurrentUser({ id: 0, name: 'Guest', role });
    }

    setCurrentPage('dashboard');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setCurrentRole(null);
    setCurrentUser(null);
    setHistoryStack([]);
    // Clear persisted page so refresh after logout lands on landing
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mda_current_page');
      sessionStorage.removeItem('mda_history_stack');
    }
    signOut({ redirect: false }).then(() => {
        setCurrentPage('landing');
    });
  };

  const navigateTo = (pageId: string) => {
    if (pageId === 'login' && currentRole !== null) {
      setShowLogoutConfirm(true);
      return;
    }

    if (currentPage && !['landing', 'login', 'register', 'parent-view'].includes(currentPage.split('?')[0])) {
      const newStack = [...historyStack, currentPage];
      setHistoryStack(newStack);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mda_history_stack', JSON.stringify(newStack));
      }
    }
    // Persist page so F5 refresh returns to same page
    if (typeof window !== 'undefined' && !['landing', 'login'].includes(pageId)) {
      sessionStorage.setItem('mda_current_page', pageId);
    }
    setCurrentPage(pageId);
  };

  const goBack = () => {
    if (historyStack.length > 0) {
      const newStack = [...historyStack];
      const prevPage = newStack.pop()!;
      setHistoryStack(newStack);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mda_history_stack', JSON.stringify(newStack));
        sessionStorage.setItem('mda_current_page', prevPage);
      }
      setCurrentPage(prevPage);
    } else {
      // Fallback saat historyStack kosong (misal setelah refresh)
      const fallback = 'santri-list';
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mda_current_page', fallback);
      }
      setCurrentPage(fallback);
    }
  };

  const showToast = (message: string) => {
    // Check if message implies success or error based on keywords (simple heuristic)
    const isError = message.toLowerCase().includes('gagal') || message.toLowerCase().includes('salah') || message.toLowerCase().includes('mohon');
    if (isError) {
        toast.error(message);
    } else {
        toast.success(message);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigateTo} />;
      case 'register':
        return <LoginPage onLogin={handleLogin} initialShowRegister={true} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        return <DashboardPage role={currentRole} onNavigate={navigateTo} currentUser={currentUser} />;
      case 'santri-list':
        return (
          <SantriManagePage onNavigate={navigateTo} onSave={showToast} currentUser={currentUser} />
        );
      case 'input-iqro':
        return <InputIqroPage onSave={showToast} currentUser={currentUser} onNavigate={navigateTo} />;
      case 'input-hafalan-doa':
        return <InputHafalnDoa onSave={showToast} currentUser={currentUser} onNavigate={navigateTo} />;
      case 'presensi':
        return <PresensiPage onSave={showToast} currentUser={currentUser} onNavigate={navigateTo} />;
      case 'kabar':
        return <KabarPage onNavigate={navigateTo} currentUser={currentUser} />;
      // case 'parent-view': REMOVED - handled in default for query params


      case 'manage-teachers':
        return <ManageTeachersPage onNavigate={navigateTo} currentUser={currentUser} />;
      case 'study-groups':
        return <StudyGroupManagePage onNavigate={navigateTo} onSave={showToast} currentUser={currentUser} />;
      case 'master-hafalan':
        return <MasterHafalanPage onNavigate={navigateTo} currentUser={currentUser} />;
      case 'activity-log':
        return <ActivityLogPage role={currentRole} currentUser={currentUser} onNavigate={navigateTo} />;
      default:
        if (currentPage?.startsWith('presensi-detail')) {
            const queryString = currentPage.split('?')[1] || '';
            const params = new URLSearchParams(queryString);
            const date = params.get('date');
            const groupId = params.get('group_id');
            return <PresensiDetailPage onNavigate={navigateTo} date={date} groupId={groupId} />;
        }
        if (currentPage?.startsWith('santri-detail')) {
            const params = new URLSearchParams(currentPage.split('?')[1]);
            const id = params.get('id') || '0';
            return <SantriDetailPage onNavigate={navigateTo} santriId={id} />;
        }
        if (currentPage?.startsWith('kabar-detail')) {
            const params = new URLSearchParams(currentPage.split('?')[1]);
            const id = parseInt(params.get('id') || '0');
            return <KabarDetailPage onNavigate={navigateTo} postId={id} currentUser={currentUser} fromPublic={!currentRole} />;
        }
        if (currentPage?.startsWith('santri-history')) {
          const queryString = currentPage.split('?')[1] || '';
          const params = new URLSearchParams(queryString);
          const id = params.get('id');
          const mode = params.get('mode');
          const returnPath = params.get('returnPath');
          return <SantriHistoryPage onNavigate={navigateTo} santriId={id} mode={mode} returnPath={returnPath} />;
        }

        if (currentPage?.startsWith('parent-view')) {
          const parentStudentId = currentPage.includes('?student_id=') ? currentPage.split('?student_id=')[1] : null;
          return <ParentViewPage onBack={goBack} onNavigate={navigateTo} studentId={parentStudentId} />;
        }
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  const showChrome = currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register' && !currentPage.startsWith('parent-view') && !(currentPage.startsWith('kabar-detail') && !currentRole);

  const getHeaderTitle = () => {
    if (currentPage === 'dashboard') return 'Dashboard';
    if (currentPage === 'santri-list') return 'Daftar Santri';
    if (currentPage === 'manage-teachers') return 'Data Guru';
    if (currentPage === 'study-groups') return 'Kelompok Belajar';
    if (currentPage === 'kabar') return 'Kabar';
    if (currentPage === 'presensi') return 'Presensi';
    if (currentPage?.startsWith('santri-detail')) return 'Profil Santri';
    if (currentPage?.startsWith('santri-history')) return 'Riwayat Santri';
    if (currentPage === 'input-iqro') return 'Setoran Bacaan';
    if (currentPage === 'activity-log') return 'Log Aktivitas';
    if (currentPage.startsWith('input-')) return 'Input Data';
    return 'Dashboard';
  };

  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-50 relative flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar for Desktop */}
      {showChrome && currentRole && (
        <div className="print:hidden h-full">
          <Sidebar role={currentRole} currentPage={currentPage} onNavigate={navigateTo} onLogout={() => navigateTo('login')} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {showChrome && (
          <div className="print:hidden">
            <Header
              role={currentRole}
              title={getHeaderTitle()}
              onBack={goBack}
              currentUser={currentUser}
              onLogout={() => navigateTo('login')}
              showBackButton={
                !['dashboard', 'santri-list', 'kabar', 'manage-teachers'].includes(
                  currentPage,
                )
              }
            />
          </div>
        )}

        <main className={`flex-1 overflow-y-auto ${(showChrome && currentRole) ? 'pb-20 md:pb-6' : ''} w-full print:overflow-visible print:pb-0`}>
          {['login', 'register', 'landing'].includes(currentPage) || currentPage.startsWith('parent-view') || (currentPage.startsWith('kabar-detail') && !currentRole) ? (
            renderPage()
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              {renderPage()}
            </div>
          )}
        </main>

        {showChrome && currentRole && (
          <div className="print:hidden w-full">
            <BottomNav role={currentRole} currentPage={currentPage} onNavigate={navigateTo} />
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-slate-600 mb-6">Apakah Anda yakin ingin keluar dari aplikasi?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 sm:py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 sm:py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
