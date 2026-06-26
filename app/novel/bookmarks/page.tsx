'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NovelBookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('valora_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const removeBookmark = (url: string) => {
    const updated = bookmarks.filter(b => b.novelUrl !== url && b.url !== url);
    setBookmarks(updated);
    localStorage.setItem('valora_bookmarks', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-20">
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2">
            <BookOpen size={18} className="text-pink-500" /> Novel Tersimpan
          </h1>
        </div>
        <div className="w-9" />
      </div>

      <div className="p-4 sm:p-6">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <BookOpen size={48} className="mb-4 opacity-50" />
            <p>Belum ada novel yang disimpan.</p>
            <Link href="/novel" className="mt-6 px-6 py-2.5 bg-green-600 font-bold text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/50">Cari Novel</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {bookmarks.map((b, i) => {
              const url = b.novelUrl || b.url;
              return (
                <Link href={url} key={i} className="bg-[#1C1D2A] rounded-xl flex flex-col relative group">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeBookmark(url); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 backdrop-blur-md rounded-lg text-white z-20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="relative w-full aspect-[3/4]">
                    <div className="w-full h-full rounded-t-xl overflow-hidden">
                      <img src={b.poster} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+' }} />
                    </div>
                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {b.type || 'Valoranovel'}
                    </div>
                    <div className="absolute -bottom-3 left-2 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md transition-transform group-hover:-translate-y-1">
                      {(() => {
                        const raw = b.chapter || b.latest_chapter;
                        if (!raw) return 'Chapter ?';
                        let clean = raw;
                        if (b.title && clean.toLowerCase().includes(b.title.toLowerCase())) {
                          clean = clean.replace(new RegExp(b.title, 'ig'), '').trim();
                        }
                        clean = clean.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '');
                        const chapMatch = clean.match(/chapter\s*\d+/i);
                        return chapMatch ? chapMatch[0] : (clean || 'Chapter ?');
                      })()}
                    </div>
                  </div>
                  <div className="p-3 pt-5 flex-1 flex flex-col justify-between bg-[#1C1D2A] rounded-b-xl z-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 leading-snug mb-2">{b.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
