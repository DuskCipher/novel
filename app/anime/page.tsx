// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Search, Play, History, Calendar, Flame, Clock, Film, Menu, MessageSquare, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AnimeCard2 from './components/AnimeCard2';
import Sidebar from '../components/Sidebar';
import { getAnimeHome, getAnimeSchedule } from '@/lib/anime-api';

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
    year: '2026',
    views: Math.floor(Math.random() * 50000) + 1000 // mock views since API might not have it
  }));

  const completeList = completedData.map((item: any) => ({
    title: item.title,
    poster: item.poster || item.thumb,
    href: `/anime/detail/${item.animeId || item.id || item.slug || item.endpoint}`,
    type: 'SERIES',
    status: 'TAMAT',
    year: '2025',
    views: Math.floor(Math.random() * 200000) + 5000
  }));

  const randomList = [...ongoingList, ...completeList].sort(() => 0.5 - Math.random()).slice(0, 4).map(i => ({...i, type: Math.random() > 0.5 ? 'MOVIE' : 'ONA'}));

  const heroItem = ongoingList[heroIndex] || null;

  return (
    <>
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pb-24 font-sans text-white">
        {/* HEADER */}
      

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="w-full">
          {/* HERO CAROUSEL */}
          {heroItem && (
            <section className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[21/9] max-h-[450px] bg-[#2A2B3D] rounded-3xl overflow-hidden mt-2 sm:mt-4 mb-6 shadow-2xl">
              <img 
                src={`/api/image-proxy?url=${encodeURIComponent(heroItem.poster)}`} 
                alt={heroItem.title} 
                className="w-full h-full object-cover opacity-80 scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F2E] via-[#1F1F2E]/80 to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="border border-zinc-500 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      Trending #1
                    </span>
                    <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      SERIES
                    </span>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight">{heroItem.title}</h2>
                  
                  <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                    Meskipun berdekatan satu sama lain, Sekolah Menengah Umum Chidori dan Akademi Swasta khusus perempuan Kikyo...
                  </p>

                  <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold text-zinc-300 mb-5">
                    <span className="flex items-center gap-1.5"><Play size={12} className="fill-current text-[#60a5fa]" /> FINISHED</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-zinc-400" /> 2025</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={heroItem.href} className="bg-[#60a5fa] hover:bg-[#3b82f6] text-[#2c131b] font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors text-xs sm:text-sm">
                      <Play size={14} className="fill-current" /> Mulai Nonton
                    </Link>
                    <Link href={heroItem.href} className="bg-[#2A2B3D] hover:bg-[#3b3c54] text-white border border-zinc-700/50 font-bold px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm">
                      Detail
                    </Link>
                  </div>
                </div>
                
                {/* Carousel Indicators */}
                <div className="absolute bottom-6 right-6 flex gap-1.5">
                  {ongoingList.slice(0, 5).map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${idx === heroIndex ? 'w-5 bg-[#60a5fa]' : 'w-1.5 bg-white/30'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SEARCH BAR */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="relative flex items-center w-full bg-[#2A2B3D] border border-zinc-700/50 rounded-full p-1.5 pr-2 shadow-lg">
              <input
                type="text"
                placeholder="Cari anime, donghua, atau movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white text-sm px-4 focus:outline-none placeholder:text-zinc-500"
              />
              <button type="submit" className="w-10 h-10 rounded-full bg-[#60a5fa] text-blue-950 flex items-center justify-center shrink-0 hover:bg-[#3b82f6] transition-colors">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* RIWAYAT (HISTORY) */}
          {history.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History className="text-zinc-400" size={20} /> Riwayat
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                  <Eye size={14} />
                  <Link href="/anime/history" className="hover:text-white flex items-center gap-1">Lihat Semua {'>'}</Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {history.slice(0, 5).map((item, i) => (
                  <Link key={i} href={item.href || `/anime/watch/${item.episodeId}`} className="group">
                    <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-[#232330] shadow-md border border-zinc-800/50 mb-2">
                      <img src={item.poster || '/api/image-proxy?url='+encodeURIComponent(item.thumb)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-0 w-full p-2">
                        <div className="bg-[#60a5fa] text-blue-950 text-[10px] font-extrabold px-2 py-1 rounded-lg text-center w-full">
                          Lanjut Eps {item.lastEpisode || 1}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-bold text-xs text-zinc-200 line-clamp-2">{item.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* TAYANG HARI INI */}
          {ongoingList.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#60a5fa]">
                  <Calendar size={20} /> Tayang Hari Ini
                </h3>
                <Link href="/anime/schedule" className="text-xs text-zinc-400 font-medium hover:text-white flex items-center gap-1">
                  Lihat Semua {'>'}
                </Link>
              </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {ongoingList.slice(0, 10).map((item: any, i: number) => (
                    <div key={i}>
                      <AnimeCard2 item={item} />
                    </div>
                  ))}
                </div>
            </section>
          )}

          {/* TERPOPULER */}
          {completeList.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#60a5fa]">
                  <Flame size={20} /> Terpopuler
                </h3>
                <Link href="/anime/completed" className="text-xs text-zinc-400 font-medium hover:text-white flex items-center gap-1">
                  Lihat Semua {'>'}
                </Link>
              </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {completeList.slice(0, 10).map((item: any, i: number) => (
                    <div key={i}>
                      <AnimeCard2 item={item} />
                    </div>
                  ))}
                </div>
            </section>
          )}

          {/* UPDATE TERBARU */}
          {ongoingList.length > 4 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#60a5fa]">
                  <Clock size={20} /> Update Terbaru
                </h3>
                <Link href="/anime/ongoing" className="text-xs text-zinc-400 font-medium hover:text-white flex items-center gap-1">
                  Lihat Semua {'>'}
                </Link>
              </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {ongoingList.slice(4, 14).map((item: any, i: number) => (
                    <div key={i}>
                      <AnimeCard2 item={{...item, status: 'WAITING'}} />
                    </div>
                  ))}
                </div>
            </section>
          )}

          {/* REKOMENDASI ACAK */}
          {randomList.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-[#60a5fa]">
                  <Film size={20} /> Rekomendasi Acak
                </h3>
                <Link href="/anime/search" className="text-xs text-zinc-400 font-medium hover:text-white flex items-center gap-1">
                  Lihat Semua {'>'}
                </Link>
              </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {randomList.slice(0, 10).map((item: any, i: number) => (
                    <div key={i}>
                      <AnimeCard2 item={item} />
                    </div>
                  ))}
                </div>
            </section>
          )}
          
        </div>
      )}



    </div>
    <div className="hidden lg:block w-[320px] shrink-0 border-l border-zinc-800/50 p-6 relative">
      <Sidebar />
    </div>
    </>
  );
}
