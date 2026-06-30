'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Trash2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/app/components/Sidebar';

export default function ComicBookmarksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('user_bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .in('category', ['Komik', 'comic', 'webtoon'])
          .order('created_at', { ascending: false });
          
        if (data) setBookmarks(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user]);

  const removeBookmark = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    try {
      setBookmarks(prev => prev.filter(b => b.item_url !== url));
      await supabase.from('user_bookmarks').delete().match({ user_id: user.id, item_url: url });
    } catch(e) {}
  };

  return (
    <>
    <div className="flex-1 min-w-0">
    <div className="min-h-screen bg-[#0D0D11] pb-24 font-sans text-white">
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
              const rawUrl = c.item_url || c.novelUrl || c.url;
              const cat = (c.category || '').toLowerCase();
              
              // Webtoon URLs are external (http...) and need wrapping
              // Comic URLs are slugs and go to /comic/detail/slug
              const isWebtoon = cat === 'webtoon' || (rawUrl && rawUrl.startsWith('http'));
              const href = isWebtoon 
                ? `/detail?url=${encodeURIComponent(rawUrl)}&source=webtoons`
                : `/comic/detail/${rawUrl}`;
              
              // For images: poster field already has the image URL
              const imgSrc = c.poster || c.thumbnail || c.image;
              
              return (
                <Link href={href} key={i} className="flex flex-col relative group gap-2">
                  <div className="relative w-full aspect-[3/4] bg-[#2A2A32] rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                    {imgSrc ? (
                      <img src={`/api/image-proxy?url=${encodeURIComponent(imgSrc)}`} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : null}
                    <span className="text-zinc-500 text-[10px] font-bold absolute z-[-1]">Not Found</span>

                    <button 
                      onClick={(e) => removeBookmark(rawUrl, e)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-red-500 backdrop-blur-md rounded-full text-white z-20 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Top Left: Type */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm drop-shadow-md ${isWebtoon ? 'bg-green-600' : 'bg-blue-600'}`}>{isWebtoon ? 'Webtoon' : (c.type || 'Komik')}</span>
                    </div>

                    {/* Top Right: Chapter */}
                    {c.chapter && (
                      <div className="absolute top-2 right-2 bg-[#f97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                        {c.chapter}
                      </div>
                    )}

                    {/* Bottom Left: Rating */}
                    {c.rating && (
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-sm">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {c.rating}
                      </div>
                    )}
                  </div>
                  
                  <div className="px-1 flex-1">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f97316] transition-colors line-clamp-2 leading-snug">{c.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
            <Bookmark size={48} className="mb-4 opacity-50" />
            <p>{!user ? 'Silakan login untuk melihat Watchlist' : 'Belum ada komik yang di-bookmark.'}</p>
          </div>
        )}
      </div>
    </div>
    </div>
    <Sidebar />
    </>
  );
}
