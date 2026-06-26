// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Search, Play, History, Calendar, Flame, Clock, Film, Eye, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimeList from '../components/AnimeList';
import Sidebar from '../components/Sidebar';
import WidgetTitle from '../components/WidgetTitle';
import { getAnimeHome } from '@/lib/anime-api';

export default function AnimeHomePage() {
  const router = useRouter();
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homeRes = await getAnimeHome();
        setHomeData(homeRes?.data || homeRes?.home || homeRes);
      } catch (error) {
        console.error("Failed to fetch anime data", error);
      } finally {
        setLoading(false);
      }

      // Read history from localStorage
      try {
        const histStr = localStorage.getItem('valora_anime_history');
        if (histStr) {
          const parsed = JSON.parse(histStr);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        }
      } catch (e) { }
    };
    fetchData();
  }, []);

  const ongoingData = homeData?.ongoing?.animeList || homeData?.on_going || [];
  const completedData = homeData?.completed?.animeList || homeData?.complete || [];

  // Auto slide hero
  useEffect(() => {
    if (ongoingData.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(5, ongoingData.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [ongoingData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/anime/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const ongoingList = ongoingData.map((item: any) => ({
    title: item.title,
    poster: item.poster || item.thumb,
    href: `/anime/detail/${item.animeId || item.id || item.slug || item.endpoint}`,
    type: 'SERIES',
    status: 'ONGOING',
  }));

  const completeList = completedData.map((item: any) => ({
    title: item.title,
    poster: item.poster || item.thumb,
    href: `/anime/detail/${item.animeId || item.id || item.slug || item.endpoint}`,
    type: 'SERIES',
    status: 'TAMAT',
  }));

  const heroItem = ongoingList[heroIndex] || null;

  return (
    <>
      <div className="flex-1 min-w-0">

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Memuat data anime...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
          {/* HERO BANNER - same style as donghua */}
          {heroItem && (
            <div className="w-full h-48 sm:h-64 lg:h-80 relative rounded-2xl overflow-hidden bg-zinc-900 group">
              <img 
                src={`/api/image-proxy?url=${encodeURIComponent(heroItem.poster)}`} 
                alt={heroItem.title} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-5 sm:p-6 lg:p-8 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Trending</span>
                  <span className="bg-zinc-700 text-zinc-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Series</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-3 line-clamp-2">{heroItem.title}</h2>
                <div className="flex items-center gap-2">
                  <Link href={heroItem.href} className="inline-block bg-white text-black hover:bg-amber-500 hover:text-white px-5 py-2 rounded-lg font-bold transition-colors text-sm">
                    <span className="flex items-center gap-1.5"><Play size={14} className="fill-current" /> Tonton Sekarang</span>
                  </Link>
                  <Link href={heroItem.href} className="inline-block border border-zinc-600 text-white hover:border-white px-4 py-2 rounded-lg font-bold transition-colors text-sm">
                    Detail
                  </Link>
                </div>
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 flex gap-1.5">
                  {ongoingList.slice(0, 5).map((_: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${idx === heroIndex ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Cari anime, movie, atau series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"
                style={{ backgroundColor: 'rgba(24,24,27,0.8)' }}
              />
            </div>
            <button type="submit" className="px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shrink-0">
              Cari
            </button>
          </form>

          {/* RIWAYAT (HISTORY) */}
          {history.length > 0 && (
            <section>
              <WidgetTitle title="Riwayat Tonton" href="/anime/search" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
                {history.slice(0, 5).map((item, i) => (
                  <Link key={i} href={item.href || `/anime/watch/${item.episodeId}`} className="group">
                    <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-2">
                      <img 
                        src={item.poster || '/api/image-proxy?url='+encodeURIComponent(item.thumb)} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 w-full p-2">
                        <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg text-center w-full">
                          Lanjut Eps {item.lastEpisode || 1}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-200 line-clamp-2 group-hover:text-amber-500 transition-colors">{item.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* SEDANG TAYANG */}
          {ongoingList.length > 0 && (
            <section>
              <WidgetTitle title="Sedang Tayang" href="/anime/ongoing" />
              <AnimeList items={ongoingList.slice(0, 15)} />
            </section>
          )}

          {/* TERPOPULER / TAMAT */}
          {completeList.length > 0 && (
            <section>
              <WidgetTitle title="Anime Tamat" href="/anime/completed" />
              <AnimeList items={completeList.slice(0, 15)} />
            </section>
          )}

          {/* UPDATE TERBARU */}
          {ongoingList.length > 5 && (
            <section>
              <WidgetTitle title="Update Terbaru" href="/anime/ongoing" />
              <AnimeList items={ongoingList.slice(5, 20)} />
            </section>
          )}

        </div>
      )}

    </div>
    <Sidebar />
    </>
  );
}
