'use client';

import Link from 'next/link';
import WidgetTitle from './WidgetTitle';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SidebarContent() {
  const searchParams = useSearchParams();
  const source = searchParams?.get('source');

  // Jika di halaman pencarian dan sourcenya BUKAN donghua, sembunyikan sidebar
  if (source && source !== 'donghua') {
    return null;
  }

  const seasonList = ["Winter 2024", "Fall 2023", "Summer 2023", "Spring 2023"];
  const azList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const menuLinks = [
    { label: "Sedang Berjalan (Ongoing)", href: "/ongoing" },
    { label: "Sudah Tamat (Completed)", href: "/completed" },
    { label: "Jadwal Rilis", href: "/donghua/jadwal" },
    { label: "Daftar Semua Genre", href: "/genres" }
  ];

  return (
    <aside className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
      <div>
        <WidgetTitle title="Menu Donghua" />
        <div className="flex flex-col gap-2 mt-4 mb-2">
          {menuLinks.map((link) => (
            <Link 
 key={link.href} 
 href={link.href}
 className="flex items-center px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-700 dark:bg-zinc-900 dark:hover:bg-amber-900/30 dark:text-zinc-300 dark:hover:text-amber-500 transition-colors font-medium text-sm"
 >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <WidgetTitle title="Seasons" />
        <div className="flex flex-wrap gap-2 mb-6 mt-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {seasonList.map((season) => (
            <Link key={season} href={`/search?q=${season}`} className="text-xs font-medium px-2.5 py-1.5 rounded bg-zinc-200 text-zinc-800 hover:bg-amber-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-amber-600 transition-colors">
              {season}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <WidgetTitle title="A-Z List" />
        <div className="flex flex-wrap gap-2 mt-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {azList.map((letter) => (
            <Link key={letter} href={`/search?q=${letter}`} className="w-8 h-8 flex items-center justify-center text-sm font-bold rounded bg-zinc-200 text-zinc-800 hover:bg-sky-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-sky-600 transition-colors">
              {letter}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-full lg:w-80 shrink-0"></aside>}>
      <SidebarContent />
    </Suspense>
  );
}
