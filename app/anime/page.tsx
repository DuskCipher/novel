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

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/anime/search?q=${encodeURIComponent(searchQuery)}`;
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
          
          {/* HERO BANNER - Premium Redesign */}
          {heroItem && (
            <div className="relative w-full aspect-[4/5] sm:aspect-[21/9] lg:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0a0a0f] group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              {/* Blurred Background Glow for depth */}
              <div className="absolute inset-0 opacity-50 scale-125 saturate-200 blur-[40px] pointer-events-none">
                <img 
                  src={`/api/image-proxy?url=${encodeURIComponent(heroItem.poster)}`} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Main Image */}
              <img 
                src={`/api/image-proxy?url=${encodeURIComponent(heroItem.poster)}`} 
                alt={heroItem.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000 ease-out"
              />

              {/* Cinematic Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/40 to-transparent sm:bg-gradient-to-r sm:from-[#0D0D11] sm:via-[#0D0D11]/80 sm:to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-transparent opacity-90 sm:hidden"></div>

              {/* Content Box */}
              <div className="absolute bottom-0 left-0 p-5 sm:p-8 lg:p-12 w-full sm:w-3/4 lg:w-2/3 flex flex-col justify-end h-full z-10">
                
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)] uppercase tracking-wide border border-rose-400/20">
                    <Flame size={12} className="animate-pulse" /> Sedang Hangat
                  </span>
                  <span className="bg-white/10 backdrop-blur-md border border-white/10 text-zinc-200 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {heroItem.status}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-[1.1] drop-shadow-2xl line-clamp-2 sm:line-clamp-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                  {heroItem.title}
                </h2>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  <Link href={heroItem.href} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black hover:bg-amber-400 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] text-sm sm:text-base hover:scale-105 active:scale-95">
                    <Play size={18} className="fill-current" />
                    <span>Tonton Sekarang</span>
                  </Link>
                  <Link href={heroItem.href} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/40 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold transition-all duration-300 text-sm sm:text-base hover:scale-105 active:scale-95">
                    <span>Detail Info</span>
                  </Link>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-5 sm:bottom-8 right-5 sm:right-8 flex gap-2 z-20">
                {ongoingList.slice(0, 5).map((_: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out ${
                      idx === heroIndex 
                        ? 'w-8 sm:w-10 bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
                        : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
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
            <button type="submit" onClick={handleSearch} className="px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-colors shrink-0">
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
