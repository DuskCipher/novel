'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book, LogOut, Menu, X, Home, Users, MessageSquare, LayoutDashboard, AlertCircle, Settings, Target, Search, ChevronDown, Bell, LifeBuoy, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Abaikan auth check jika sedang di halaman login
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    const isAuth = sessionStorage.getItem('valora_admin_auth');
    if (isAuth !== 'true') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Memuat...</div>;
  }

  // Jika di halaman login, jangan tampilkan sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    sessionStorage.removeItem('valora_admin_auth');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Valora Logo" className="w-12 h-12 object-contain" />
          <h2 className="text-xl font-bold text-blue-400">Admin</h2>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-zinc-400 hover:text-white">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Redesigned to match Untitled UI */}
      <aside className={`${menuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 bg-[#0F1115] border-r border-zinc-800 flex-col p-4 md:sticky md:top-0 md:h-screen fixed inset-0 top-[73px] z-40 overflow-y-auto`}>
        
        {/* User Profile Card */}
        <div className="flex items-center justify-between p-3 bg-[#1A1D21] rounded-xl mb-4 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/avatar.jpeg" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A1D21] rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100">Valora Admin</span>
              <span className="text-xs text-zinc-400">admin@valora.com</span>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Workspace Title */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-semibold text-zinc-100 border-b-2 border-white pb-1">
            Valora Dashboard
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white">
            <Plus size={14} /> Create team
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#1A1D21] border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <Link href="/admin" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname === '/admin' ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <LayoutDashboard size={18} className={pathname === '/admin' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Overview
            </div>
          </Link>
          <Link href="/admin/novel" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname.startsWith('/admin/novel') ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <Book size={18} className={pathname.startsWith('/admin/novel') ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Kelola Konten
            </div>
            <ChevronDown size={16} className="text-zinc-600" />
          </Link>
          <Link href="/admin/users" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname === '/admin/users' ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <Users size={18} className={pathname === '/admin/users' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Kelola User
            </div>
            <ChevronDown size={16} className="text-zinc-600" />
          </Link>
          <Link href="/admin/comments" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname === '/admin/comments' ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <MessageSquare size={18} className={pathname === '/admin/comments' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Komentar
            </div>
            <ChevronDown size={16} className="text-zinc-600" />
          </Link>
          <Link href="/admin/reports" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname === '/admin/reports' ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <AlertCircle size={18} className={pathname === '/admin/reports' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Laporan Error
            </div>
            <ChevronDown size={16} className="text-zinc-600" />
          </Link>
          <Link href="/admin/missions" onClick={() => setMenuOpen(false)} className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors group ${pathname === '/admin/missions' ? 'bg-[#1A1D21] text-white' : 'text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200'}`}>
            <div className="flex items-center gap-3 font-medium text-sm">
              <Target size={18} className={pathname === '/admin/missions' ? 'text-zinc-300' : 'text-zinc-500 group-hover:text-zinc-400'} />
              Gamifikasi
            </div>
            <ChevronDown size={16} className="text-zinc-600" />
          </Link>

          <div className="h-px bg-zinc-800 w-full my-4"></div>

          <Link href="/admin/notifications" className="px-3 py-2.5 rounded-lg flex items-center justify-between text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200 transition-colors group">
            <div className="flex items-center gap-3 font-medium text-sm">
              <Bell size={18} className="text-zinc-500 group-hover:text-zinc-400" />
              Notifications
            </div>
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4</span>
          </Link>
          <Link href="/" className="px-3 py-2.5 rounded-lg flex items-center justify-between text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200 transition-colors group">
            <div className="flex items-center gap-3 font-medium text-sm">
              <LifeBuoy size={18} className="text-zinc-500 group-hover:text-zinc-400" />
              Support
            </div>
          </Link>
          <Link href="/admin/settings" className="px-3 py-2.5 rounded-lg flex items-center justify-between text-zinc-400 hover:bg-[#1A1D21] hover:text-zinc-200 transition-colors group">
            <div className="flex items-center gap-3 font-medium text-sm">
              <Settings size={18} className="text-zinc-500 group-hover:text-zinc-400" />
              Settings
            </div>
          </Link>

          <div className="mt-auto pt-4">
            <button onClick={handleLogout} className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 transition-colors text-left font-medium text-sm">
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}
