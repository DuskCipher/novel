'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book, LogOut, Menu, X, Home, Users, MessageSquare, LayoutDashboard } from 'lucide-react';
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

      {/* Sidebar */}
      <aside className={`${menuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex-col p-4 md:sticky md:top-0 md:h-screen fixed inset-0 top-[73px] z-40`}>
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <img src="/logo.png" alt="Valora Logo" className="w-14 h-14 object-contain" />
          <h2 className="text-2xl font-bold text-blue-400">Valora Admin</h2>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Link 
            href="/admin" 
            onClick={() => setMenuOpen(false)}
            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${pathname === '/admin' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            href="/admin" 
            onClick={() => setMenuOpen(false)}
            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${pathname.startsWith('/admin/novel') ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            <Book size={20} />
            Kelola Novel
          </Link>
          <Link 
            href="/admin/users" 
            onClick={() => setMenuOpen(false)}
            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${pathname === '/admin/users' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            <Users size={20} />
            Kelola User
          </Link>
          <Link 
            href="/admin/comments" 
            onClick={() => setMenuOpen(false)}
            className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${pathname === '/admin/comments' ? 'bg-blue-600/10 text-blue-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            <MessageSquare size={20} />
            Kelola Komentar
          </Link>

          <div className="mt-auto flex flex-col gap-2">
            <Link 
              href="/" 
              className="p-3 rounded-xl flex items-center gap-3 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <Home size={20} />
              Ke Beranda Web
            </Link>
            <button 
 onClick={handleLogout}
 className="p-3 rounded-xl flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors text-left"
 >
              <LogOut size={20} />
              Logout Admin
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
