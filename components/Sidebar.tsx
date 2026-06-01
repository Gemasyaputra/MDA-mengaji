'use client';

import { Home, Users, MessageSquare, Settings, BarChart3, LogOut, BookOpen, Activity } from 'lucide-react';

interface SidebarProps {
  role: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ role, currentPage, onNavigate, onLogout }: SidebarProps) {
  const getNavItems = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'santri-list', label: 'Data Santri', icon: Users },
          { id: 'presensi', label: 'Presensi', icon: Activity },
          { id: 'input-hafalan-doa', label: 'Setoran Doa', icon: BookOpen },
          { id: 'study-groups', label: 'Kelompok Kelas', icon: Users },
          { id: 'manage-teachers', label: 'Data Guru', icon: Users },
          { id: 'master-hafalan', label: 'Bank Materi', icon: BookOpen },
          { id: 'kabar', label: 'Kabar & Info', icon: MessageSquare },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'santri-list', label: 'Data Santri', icon: Users },
          { id: 'presensi', label: 'Presensi', icon: Activity },
          { id: 'input-iqro', label: 'Setoran Tilawah', icon: BookOpen },
          { id: 'input-hafalan-doa', label: 'Setoran Doa', icon: BookOpen },
          { id: 'master-hafalan', label: 'Bank Materi', icon: BookOpen },
          { id: 'kabar', label: 'Kabar & Info', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-emerald-800 text-white h-screen shadow-2xl sticky top-0 z-[60] shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-emerald-700/50">
        <div className="w-10 h-10 bg-white text-emerald-800 rounded-xl flex items-center justify-center font-black shadow-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C11.5 2 11 2.5 11 3v2.1A5.002 5.002 0 0 0 7 10v4H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2h-2v-4a5.002 5.002 0 0 0-4-4.9V3c0-.5-.5-1-1-1zm0 24c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM9 13v-3c0-1.7 1.3-3 3-3s3 1.3 3 3v3h-6zm-4 7v-2h14v2H5z"/>
          </svg>
        </div>
        <div>
          <h2 className="font-black text-lg leading-tight tracking-tight">MDA Masjid<br/>Nurul Huda</h2>
        </div>
      </div>
      
      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest mb-4">Menu Navigasi</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id || (id === 'santri-list' && currentPage?.startsWith('santri-detail'));
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-emerald-800 shadow-md scale-[1.02]' 
                  : 'text-emerald-100/80 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-emerald-400/80'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Logout Button — pinned at bottom */}
      <div className="px-4 pb-6 border-t border-emerald-700/50 pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <LogOut size={20} className="text-red-400" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
