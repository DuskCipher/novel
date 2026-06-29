'use client';

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Search as SearchIcon, Compass, Flame, Sparkles, Star, Heart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import AnimeCard3 from '../components/AnimeCard3';
import { searchAnime, getAnimeOngoing } from '@/lib/anime-api';
import Sidebar from '../../components/Sidebar';

function AnimeSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [list, setList] = useState<any[]>([]);
  const [exploreList, setExploreList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [activeTab, setActiveTab] = useState('Semua');

  useEffect(() => {
    if (!initialQuery) {
      setLoading(true);
      getAnimeOngoing(1).then(res => {
        const items = res?.animeList || res?.data || res || [];
        setExploreList(Array.isArray(items) ? items : []);
        setLoading(false);
      });
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await searchAnime(q);
      const items = res?.data?.animeList || res?.animeList || res?.search_results || (Array.isArray(res?.data) ? res.data : []);
      const mapped = (Array.isArray(items) ? items : []).map((item: any) => ({
        title: item.title,
        poster: item.poster || item.thumb,
        href: `/anime/detail/${item.animeId || item.id || item.slug || item.endpoint}`,
        type: 'SERIES',
        status: item.status || 'UNKNOWN',
        year: '2026',
        views: item.score || item.rating || 'N/A'
      }));
      setList(mapped);
    } catch (error) {
      console.error("Failed to search anime", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.replace(`/anime/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const tabs = [
    { id: 'Semua', label: 'Semua' },
    { id: 'Hot', label: 'Hot', icon: Flame },
    { id: 'Terbaru', label: 'Terbaru', icon: Sparkles },
    { id: 'Popular', label: 'Popular', icon: Star },
    { id: 'Untukmu', label: 'Untukmu', icon: Heart }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen text-white pb-24 font-sans w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2A2B3D] flex items-center justify-center">
            <Compass size={24} className="text-[#60a5fa]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Explore & Cari Anime</h1>
        </div>
        <form onSubmit={handleSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#2A2B3D] text-white pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#60a5fa] placeholder-zinc-500 font-medium text-sm"
          />
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        </form>
      </div>

      {/* Filter Pills */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 pb-2">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs transition-colors ${
                isActive 
                  ? 'bg-[#60a5fa] text-blue-950 shadow-md' 
                  : 'bg-[#2A2B3D] text-zinc-300 hover:bg-[#3b3c54]'
              }`}
            >
              {Icon && <Icon size={14} className={isActive ? 'text-blue-950' : 'text-amber-500'} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasSearched && list.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">Tidak ada hasil ditemukan untuk "{query}".</div>
        ) : hasSearched ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
              <div className="w-1 h-6 bg-[#60a5fa] rounded-full"></div>
              <h2 className="text-lg font-bold text-white">Hasil Pencarian</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {list.map((item, i) => (
                <AnimeCard3 key={i} item={item} href={item.href} type="explore" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Hot Section Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-2 mb-2">
              <Flame size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-white">Hot</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {exploreList.slice(0, 15).map((item, i) => (
                <AnimeCard3 key={i} item={item} href={`/anime/detail/${item.animeId || item.id}`} type="explore" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnimeSearchPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div></div>}>
        <AnimeSearchContent />
      </Suspense>
      <Sidebar />
    </>
  );
}
