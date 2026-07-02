'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';

export default function NovelGenrePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [novels, setNovels] = useState<any[]>([]);
  const [genreName, setGenreName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchGenre = async () => {
      try {
        // Support both sakura- prefix and raw slug
        const slug = id.startsWith('sakura-') ? id.replace('sakura-', '') : id;
        const res = await fetch(`/api/novel/sakuranovel/genre/${slug}`);
        const json = await res.json();
        
        let items: any[] = [];
        if (json?.data?.results) items = json.data.results;
        else if (json?.result?.items) items = json.result.items;
        else if (Array.isArray(json?.result)) items = json.result;
        else if (json?.data?.items) items = json.data.items;
        else if (Array.isArray(json?.data)) items = json.data;
        else if (Array.isArray(json)) items = json;
        
        setNovels(items);
        setGenreName(json?.result?.genre_name || json?.result?.name || slug);
      } catch (error) {
        console.error("Failed to fetch novel genre:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenre();
  }, [id]);

  const getImageUrl = (item: any) => {
    const src = item?.poster || item?.cover || item?.thumbnail || '';
    if (!src) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48L3N2Zz4=';
    let finalSrc = typeof src === 'string' ? src : src.url || '';
    if (finalSrc.includes('sakuranovel.id')) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48L3N2Zz4=';
    if (finalSrc && finalSrc.includes('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(finalSrc)}`;
    }
    return finalSrc;
  };

  return (
    <>
    <div className="flex-1 min-w-0">
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-20">
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center max-w-[1600px] mx-auto">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-sm sm:text-base capitalize">
            Genre: <span className="text-pink-500">{genreName || 'Memuat...'}</span>
          </h1>
        </div>
        <div className="w-9" />
      </div>

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : novels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5">
            {novels.map((item: any, i: number) => (
              <Link href={`/novel/detail/sakura-${item.slug}`} key={i} className="flex flex-col relative group gap-2">
                <div className="relative w-full aspect-[3/4] bg-[#2A2A32] rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                  <img src={getImageUrl(item)} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="text-zinc-500 text-[10px] font-bold absolute z-[-1]">Not Found</span>

                  {/* Top Left: Novel */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-white text-[10px] font-bold px-1 py-0.5 drop-shadow-md">Novel</span>
                  </div>

                  {/* Top Right: Chapter Pill */}
                  {(() => {
                    const raw = item.latest_chapter || item.chapter;
                    if (!raw) return null;
                    let clean = raw;
                    if (item.title && clean.toLowerCase().includes(item.title.toLowerCase())) {
                      clean = clean.replace(new RegExp(item.title, 'ig'), '').trim();
                    }
                    clean = clean.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '');
                    const chapMatch = clean.match(/chapter\s*\d+/i);
                    const displayChap = chapMatch ? chapMatch[0] : (clean || 'Top');
                    return (
                      <div className="absolute top-2 right-2 bg-[#f97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm capitalize">
                        {displayChap}
                      </div>
                    );
                  })()}

                  {/* Bottom Left: Score/Rating */}
                  {(item.score || item.rating) && (
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center gap-1 shadow-sm">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      {item.score || item.rating}
                    </div>
                  )}
                </div>
                
                <div className="px-1 flex-1">
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f97316] transition-colors line-clamp-2 leading-snug">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Tidak ada novel di genre ini.
          </div>
        )}
      </div>
    </div>
    </div>
    <Sidebar />
    </>
  );
}
