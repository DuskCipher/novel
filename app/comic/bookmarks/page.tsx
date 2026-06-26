'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Trash2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ComicBookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const bookmarksStr = localStorage.getItem('valora_bookmarks');
      if (bookmarksStr) {
        const allBookmarks = JSON.parse(bookmarksStr);
        // Filter only comic bookmarks (those with URL containing /comic/detail)
        const comicBookmarks = allBookmarks.filter((b: any) => 
          (b.novelUrl && b.novelUrl.includes('/comic/detail')) || 
          (b.url && b.url.includes('/comic/detail'))
        );
        setBookmarks(comicBookmarks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeBookmark = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const bookmarksStr = localStorage.getItem('valora_bookmarks');
      if (bookmarksStr) {
        const allBookmarks = JSON.parse(bookmarksStr);
        const newBookmarks = allBookmarks.filter((b: any) => b.novelUrl !== url && b.url !== url);
        localStorage.setItem('valora_bookmarks', JSON.stringify(newBookmarks));
        setBookmarks(newBookmarks.filter((b: any) => 
          (b.novelUrl && b.novelUrl.includes('/comic/detail')) || 
          (b.url && b.url.includes('/comic/detail'))
        ));
      }
    } catch(e) {}
  };

  return (
    <div className="min-h-screen bg-[#0D0D11] pb-24">
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white font-bold text-sm sm:text-base">Bookmarks Komik</h1>
        <div className="w-9"></div> {/* spacer */}
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-zinc-500 mt-4">Memuat bookmark...</p>
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {bookmarks.map((c: any, i: number) => {
              const url = c.novelUrl || c.url;
              return (
                <Link href={url} key={i} className="bg-[#1C1D2A] rounded-xl flex flex-col relative group">
                  <button 
                    onClick={(e) => removeBookmark(url, e)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 backdrop-blur-md rounded-lg text-white z-20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="relative w-full aspect-[3/4]">
                    <div className="w-full h-full rounded-t-xl overflow-hidden">
                      <img src={`/api/image-proxy?url=${encodeURIComponent(c.poster || c.thumbnail || c.image)}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+'} } />
                    </div>
                    <div className={`absolute top-2 left-2 ${c.type?.toLowerCase() === 'manhua' ? 'bg-emerald-500' : c.type?.toLowerCase() === 'manga' ? 'bg-blue-500' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>
                      {c.type || 'Manhwa'}
                    </div>
                    <div className="absolute -bottom-3 left-2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md transition-transform group-hover:-translate-y-1">
                      {c.chapter || 'Chapter ?'}
                    </div>
                  </div>
                  <div className="p-3 pt-5 flex-1 flex flex-col justify-between bg-[#1C1D2A] rounded-b-xl z-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 leading-snug mb-2">{c.title}</h3>
                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-400">
                      <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {c.rating || '8.5'}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {c.description?.replace('Update ', '') || '2h ago'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
            <Bookmark size={48} className="mb-4 opacity-50" />
            <p>Belum ada komik yang di-bookmark.</p>
          </div>
        )}
      </div>
    </div>
  );
}
