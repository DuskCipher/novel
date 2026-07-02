'use client';

import { useState, useEffect } from 'react';
import { Search, X, BookOpen, Flame, Clock, Bookmark, List, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import AnimeList from '../components/AnimeList';

export default function NovelHubPage() {
  const [data, setData] = useState<any>({ trending: [], latest: [], genres: [], adminNovels: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);

  useEffect(() => {
    if (data.latest.length === 0) return;
    const interval = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % Math.min(data.latest.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [data.latest.length]);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const [homeRes, genreRes, adminRes] = await Promise.all([
          fetch('/api/novel/sakuranovel/home').then(r => r.json()).catch(() => ({ result: { items: [] } })),
          fetch('/api/novel/sakuranovel/genres').then(r => r.json()).catch(() => ({ result: { items: [] } })),
          fetch('/api/novels').then(r => r.json()).catch(() => []),
        ]);

        let latest: any[] = [];
        let genres: any[] = [];

        if (homeRes?.data?.results) {
          latest = homeRes.data.results;
        } else if (Array.isArray(homeRes?.data)) {
          latest = homeRes.data;
        } else if (homeRes?.result?.items) {
          latest = homeRes.result.items;
        } else if (Array.isArray(homeRes?.result)) {
          latest = homeRes.result;
        }

        if (genreRes?.data?.results) {
          genres = genreRes.data.results;
        } else if (Array.isArray(genreRes?.data)) {
          genres = genreRes.data;
        } else if (genreRes?.result?.items) {
          genres = genreRes.result.items;
        } else if (Array.isArray(genreRes?.result)) {
          genres = genreRes.result;
        }

        let adminNovels: any[] = [];
        if (Array.isArray(adminRes)) {
           adminNovels = adminRes;
        }

        setData({ latest, genres, adminNovels });
      } catch (error) {
        console.error("Failed to fetch novel hub data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHubData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/novel/sakuranovel/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      let results: any[] = [];
      if (json?.data?.results) results = json.data.results;
      else if (Array.isArray(json?.data)) results = json.data;
      else if (json?.result?.items) results = json.result.items;
      else if (Array.isArray(json?.result)) results = json.result;
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatNovelForAnimeList = (item: any, isOriginal = false) => {
    const rawChapter = item.latest_chapter || item.chapter;
    let episodesText = 'Top';
    if (rawChapter) {
      let clean = rawChapter;
      if (item.title && clean.toLowerCase().includes(item.title.toLowerCase())) {
        clean = clean.replace(new RegExp(item.title, 'ig'), '').trim();
      }
      clean = clean.replace(/^[-–—:\s]+|[-–—:\s]+$/g, '');
      const chapMatch = clean.match(/chapter\s*\d+/i);
      episodesText = chapMatch ? chapMatch[0] : (clean || 'Top');
    }

    // Hindari sakuranovel image block jika memungkinkan (AnimeList menangani proxy & fallback onError)
    let posterUrl = item?.poster || item?.cover || item?.thumbnail || '';
    if (posterUrl.includes('sakuranovel.id')) {
        // Biarkan image proxy mencoba, jika gagal AnimeList punya fallback
    }

    return {
      ...item,
      poster: posterUrl,
      href: isOriginal ? `/novel/detail/${item.slug}` : `/novel/detail/sakura-${item.slug}`,
      episodes: episodesText,
      rating: item.score || '9.0',
      status: isOriginal ? 'Original' : 'Novel'
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const heroItems = [...(data.adminNovels || []), ...(data.latest || [])].slice(0, 5);
  const heroItem = heroItems[trendingIndex] || heroItems[0];

  return (
    <>
    <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#0a0a0c] overflow-y-auto pb-20 md:pb-6 relative z-0">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0c]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            id="novel-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari novel Sakura..."
            className="w-full bg-[#1C1D2A] text-white text-sm rounded-full pl-10 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-pink-500"
            ref={(el) => {
              if (el && typeof window !== 'undefined' && window.location.search.includes('focus=true') && !el.dataset.focused) {
                el.dataset.focused = 'true';
                setTimeout(() => el.focus(), 100);
              }
            }}
          />
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
              <X size={16} />
            </button>
          )}
        </form>
      </header>

      {/* SEARCH RESULTS */}
      {searchQuery && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-[#0a0a0c] min-h-screen px-4 py-4">
          <h2 className="text-lg font-bold text-white mb-4">Hasil Pencarian: <span className="text-pink-400">{searchQuery}</span></h2>
          {isSearching ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : searchResults.length > 0 ? (
            <AnimeList items={searchResults.map(item => formatNovelForAnimeList(item, false))} />
          ) : (
            <div className="text-center py-10 text-zinc-500">Tidak menemukan novel dengan judul tersebut.</div>
          )}
        </div>
      )}

      <div className="flex-1 w-full flex flex-col gap-6 md:gap-8 pt-2">
        {!searchQuery && (
          <>
            {/* HERO BANNER */}
            {heroItem && (
              <section className="px-4 sm:px-6">
                <Link href={data.adminNovels?.some((n: any) => n.slug === heroItem.slug) ? `/novel/detail/${heroItem.slug}` : `/novel/detail/sakura-${heroItem.slug}`} className="w-full h-48 sm:h-64 relative rounded-2xl overflow-hidden bg-zinc-900 shadow-xl group block">
                  <img 
                    key={trendingIndex}
                    src={heroItem.poster || heroItem.cover || heroItem.thumbnail || ''} 
                    alt={heroItem.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 animate-in fade-in" 
                    onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22600%22%20fill%3D%22%2327272a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%2371717a%22%3ENot%20Found%3C%2Ftext%3E%3C%2Fsvg%3E' }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
                    <div>
                      <span className={`${data.adminNovels?.some((n: any) => n.slug === heroItem.slug) ? 'bg-amber-500' : 'bg-pink-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm mb-2 inline-block uppercase`}>
                        {data.adminNovels?.some((n: any) => n.slug === heroItem.slug) ? 'Original Novel' : 'Valoranovel'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 line-clamp-1">{heroItem.title}</h2>
                      <div className="flex items-center gap-2 text-xs">
                        {heroItem.score && <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded flex items-center gap-1"><Star size={10} className="fill-blue-400" /> {heroItem.score}</span>}
                        {heroItem.author && <span className="text-zinc-400 flex items-center gap-1"><BookOpen size={10} /> {heroItem.author}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 mb-1">
                      {heroItems.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === trendingIndex ? 'bg-white' : 'bg-white/30'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* QUICK MENU */}
            <section className="px-4 sm:px-6">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                <Link href="/novel/genres" className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#1C1D2A] flex items-center justify-center text-pink-500"><List size={22}/></div>
                  <span className="text-[10px] text-zinc-300">Genre</span>
                </Link>
                <Link href="/novel/bookmarks" className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#1C1D2A] flex items-center justify-center text-green-500"><Bookmark size={22}/></div>
                  <span className="text-[10px] text-zinc-300">Tersimpan</span>
                </Link>
                <Link href="/novel/daftar-novel" className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#1C1D2A] flex items-center justify-center text-blue-500"><BookOpen size={22}/></div>
                  <span className="text-[10px] text-zinc-300">Daftar A-Z</span>
                </Link>
              </div>
            </section>

            {/* GENRE CHIPS */}
            {data.genres.length > 0 && (
              <section className="px-4 sm:px-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {data.genres.map((g: any, i: number) => (
                    <Link href={`/novel/genre/sakura-${g.slug || g.id}`} key={i} className="flex-none bg-[#1C1D2A] border border-zinc-800 text-zinc-300 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-pink-600 hover:text-white transition-colors whitespace-nowrap">
                      {g.name || g.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ORIGINAL NOVEL LIST */}
            {data.adminNovels && data.adminNovels.length > 0 && (
              <section className="px-4 sm:px-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    Karya Original
                  </h2>
                </div>
                <AnimeList items={data.adminNovels.map((n: any) => formatNovelForAnimeList(n, true))} />
              </section>
            )}

            {/* NOVEL TERBARU LIST */}
            {data.latest.length > 0 && (
              <section className="px-4 sm:px-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                    Novel Terbaru
                  </h2>
                  <Link href="/novel/daftar-novel" className="text-xs text-pink-400 flex items-center gap-1 hover:text-pink-300">
                    Lihat Semua <ChevronRight size={14} />
                  </Link>
                </div>
                <AnimeList items={data.latest.map((n: any) => formatNovelForAnimeList(n, false))} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
    <Sidebar />
    </>
  );
}
