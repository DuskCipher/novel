// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Search, X, BookOpen, Flame, Clock, Bookmark, List, Star } from 'lucide-react';
import Link from 'next/link';
import AnimeList from '../components/AnimeList'; // Reusing AnimeList since they share similar structure
import WidgetTitle from '../components/WidgetTitle';
import Sidebar from '../components/Sidebar';

export default function ComicHubPage() {
  const [data, setData] = useState<any>({ trending: [], popular: [], latest: [], berwarna: [], webtoons: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);

  useEffect(() => {
    if (data.trending.length === 0) return;
    const interval = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % data.trending.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data.trending.length]);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const [popRes, terbaruRes, genreRes, trendingRes, coloredRes, webtoonRes] = await Promise.all([
          fetch('/api/comic/populer').then(r => r.json()).catch(() => ({comics: []})),
          fetch('/api/comic/terbaru').then(r => r.json()).catch(() => ({comics: []})),
          fetch('/api/comic/genres').then(r => r.json()).catch(() => ({data: []})),
          fetch('/api/comic/trending').then(r => r.json()).catch(() => ({comics: []})),
          fetch('/api/comic/berwarna/1').then(r => r.json()).catch(() => ({data: {results: []}})),
          fetch('/api/trending?source=webtoons').then(r => r.json()).catch(() => ({items: []})),
        ]);
        
        const pop = popRes?.comics || [];
        const terbaru = terbaruRes?.comics || [];
        const genres = Array.isArray(genreRes?.data) ? genreRes.data : [];
        const parseSlug = (link: string) => {
          if (!link) return '';
          if (link.startsWith('/')) {
             const m = link.match(/\/manga\/([^/]+)/);
             if (m) return m[1];
             return link.replace(/^\/|\/$/g, ''); // strip slashes
          }
          const urlMatch = link.match(/\/manga\/([^/]+)/);
          return urlMatch ? urlMatch[1] : link;
        };

        const parsedPop = (popRes.comics || popRes.data || []).map((c: any) => ({ ...c, slug: parseSlug(c.link || c.href || c.url) }));
        const parsedTerbaru = (terbaruRes.comics || terbaruRes.data || []).map((c: any) => ({ ...c, slug: parseSlug(c.link || c.href || c.url) }));
        const parsedTrending = (trendingRes.trending || trendingRes.comics || trendingRes.data || []).map((c: any) => ({ ...c, slug: parseSlug(c.link || c.href || c.url) }));
        const parsedColored = (coloredRes.data?.results || []).map((c: any) => ({ ...c, slug: parseSlug(c.link || c.href || c.url) }));

        const hardcodedGenres = [
          { name: 'Action', slug: 'action' },
          { name: 'Romance', slug: 'romance' },
          { name: 'Fantasy', slug: 'fantasy' },
          { name: 'Adventure', slug: 'adventure' },
          { name: 'Comedy', slug: 'comedy' },
          { name: 'Drama', slug: 'drama' },
          { name: 'Isekai', slug: 'isekai' },
          { name: 'Magic', slug: 'magic' },
          { name: 'Martial Arts', slug: 'martial-arts' },
          { name: 'Shounen', slug: 'shounen' }
        ];

        setData({
          popular: parsedPop,
          latest: parsedTerbaru,
          trending: parsedTrending,
          genres: (Array.isArray(genreRes?.data) && genreRes.data.length > 0) ? genreRes.data : hardcodedGenres,
          berwarna: parsedColored,
          webtoons: webtoonRes?.items || []
        });
      } catch (error) {
        console.error("Failed to fetch comic hub data:", error);
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
      const [comicRes, webtoonRes] = await Promise.all([
        fetch(`/api/comic/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json()).catch(() => ({})),
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&source=webtoons`).then(r => r.json()).catch(() => ({}))
      ]);
      
      let results: any[] = [];
      if (comicRes?.data) results = [...results, ...comicRes.data];
      
      if (webtoonRes?.items && Array.isArray(webtoonRes.items)) {
        const wt = webtoonRes.items.map((item: any) => ({ ...item, isWebtoon: true }));
        results = [...results, ...wt];
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
    <div className="flex-1 min-w-0 min-h-screen pb-24">
      <div className="px-4 sm:px-6 flex flex-col gap-8 pt-4">
        
        {/* 1. Slider Trending */}
        {!loading && data.trending.length > 0 && (
          <Link href={`/comic/detail/${data.trending[trendingIndex]?.slug}`} className="w-full h-48 sm:h-64 relative rounded-2xl overflow-hidden bg-zinc-900 shadow-xl group block">
            <img 
              key={trendingIndex}
              src={`/api/image-proxy?url=${encodeURIComponent(data.trending[trendingIndex]?.poster || data.trending[trendingIndex]?.image)}`} 
              alt="Trending" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 animate-in fade-in" 
              onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+' }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
              <div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm mb-2 inline-block uppercase">Trending</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 line-clamp-1">{data.trending[trendingIndex]?.title}</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">{data.trending[trendingIndex]?.chapter || 'Tamat'}</span>
                  <span className="text-zinc-400 flex items-center gap-1">⚡ {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                </div>
              </div>
              <div className="flex gap-1 mb-1">
                {data.trending.slice(0, 5).map((_: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === trendingIndex ? 'bg-white' : 'bg-white/30'}`}
                  ></div>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* 2. Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul komik..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-24 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors">
              Cari
            </button>
          </div>
          <Link href="/comic/advanced-search" className="w-12 h-[50px] bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </Link>
        </form>

        {/* Render Search Results if searching */}
        {(isSearching || searchResults.length > 0) ? (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">Hasil Pencarian</h2>
              <button onClick={() => {setSearchResults([]); setSearchQuery('');}} className="text-red-500 text-xs font-bold">Tutup</button>
            </div>
            {isSearching ? <div className="text-zinc-500">Mencari...</div> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                {searchResults.map((c: any, i: number) => (
                  <Link href={c.isWebtoon ? `/detail?url=${encodeURIComponent(c.url)}&source=webtoons` : `/comic/detail/${c.slug}`} key={i} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 aspect-[3/4]">
                    <img src={`/api/image-proxy?url=${encodeURIComponent(c.thumbnail || c.poster || c.image)}`} alt={c.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+'} } />
                    <div className={`absolute top-2 left-2 ${c.isWebtoon ? 'bg-green-500' : 'bg-blue-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>{c.isWebtoon ? 'Webtoon' : 'Komik'}</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 p-3">
                      <h3 className="text-white font-bold text-xs line-clamp-2">{c.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>


            {/* 3. Genres Horizontal Scroll */}
            <section>
              <h2 className="text-xs font-bold text-zinc-500 tracking-wider mb-3 uppercase">Genres</h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {data.genres?.map((g: any, i: number) => (
                  <Link 
                    key={i} 
                    href={`/comic/list?genre=${g.slug}`}
                    className="whitespace-nowrap px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs text-zinc-300 hover:bg-amber-600 hover:text-white hover:border-amber-500 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* 4. Quick Menu */}
            <section>
              <h2 className="text-xs font-bold text-zinc-500 tracking-wider mb-3 uppercase">Quick Menu</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 bg-[#151728] p-4 rounded-2xl mb-8 border border-zinc-800/50 w-full">
                <Link href="/comic/bookmarks" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Bookmark className="text-amber-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Bookmarks</span>
                </Link>
                <Link href="/comic/pustaka" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <BookOpen className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Pustaka</span>
                </Link>
                <Link href="/comic/list?sort=trending" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Flame className="text-orange-500 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Trending</span>
                </Link>
                <Link href="/comic/list?status=ongoing" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <Clock className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Ongoing</span>
                </Link>
                <Link href="/comic/list?status=completed" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Tamat</span>
                </Link>
                <Link href="/comic/type/manhwa" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  {/* South Korea Flag */}
                  <div className="w-7 h-5 rounded overflow-hidden group-hover:scale-110 transition-transform shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="28" height="20">
                      <rect width="900" height="600" fill="white"/>
                      {/* Trigrams - black bars simplified */}
                      <g fill="none" stroke="black" strokeWidth="30">
                        {/* Top-left trigram (Qian) */}
                        <line x1="132" y1="138" x2="212" y2="58"/>
                        <line x1="171" y1="178" x2="251" y2="98"/>
                        {/* Top-right trigram (Kan) */}
                        <line x1="688" y1="138" x2="768" y2="58"/>
                        <line x1="649" y1="178" x2="729" y2="98"/>
                        {/* Bottom-right trigram (Kon) */}
                        <line x1="688" y1="462" x2="768" y2="542"/>
                        <line x1="649" y1="422" x2="729" y2="502"/>
                        {/* Bottom-left trigram (Li) */}
                        <line x1="132" y1="462" x2="212" y2="542"/>
                        <line x1="171" y1="422" x2="251" y2="502"/>
                      </g>
                      {/* Taeguk circle */}
                      <circle cx="450" cy="300" r="130" fill="#cd2e3a"/>
                      <path d="M450 170 a130 130 0 0 1 0 260 a65 65 0 0 1 0-130 a65 65 0 0 0 0-130z" fill="#0047a0"/>
                      <circle cx="450" cy="235" r="32.5" fill="#0047a0"/>
                      <circle cx="450" cy="365" r="32.5" fill="#cd2e3a"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Manhwa</span>
                </Link>
                <Link href="/comic/type/manhua" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  {/* China Flag */}
                  <div className="w-7 h-5 rounded overflow-hidden group-hover:scale-110 transition-transform shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="28" height="20">
                      <rect width="900" height="600" fill="#DE2910"/>
                      {/* Large star */}
                      <polygon points="150,75 179,168 87,109 213,109 121,168" fill="#FFDE00"/>
                      {/* 4 small stars */}
                      <polygon points="255,30 264,57 240,41 270,41 246,57" fill="#FFDE00"/>
                      <polygon points="300,90 309,117 285,101 315,101 291,117" fill="#FFDE00"/>
                      <polygon points="300,165 309,192 285,176 315,176 291,192" fill="#FFDE00"/>
                      <polygon points="255,225 264,252 240,236 270,236 246,252" fill="#FFDE00"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Manhua</span>
                </Link>
                <Link href="/comic/type/manga" className="flex flex-col items-center justify-center gap-2 group p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                  {/* Japan Flag */}
                  <div className="w-7 h-5 rounded overflow-hidden group-hover:scale-110 transition-transform shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="28" height="20">
                      <rect width="900" height="600" fill="white"/>
                      <circle cx="450" cy="300" r="180" fill="#BC002D"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium text-center">Manga</span>
                </Link>
              </div>
            </section>

          {/* Berwarna Section */}
          {data.berwarna.length > 0 && (
            <section className="mt-6 mb-2">
              <WidgetTitle title="Komik Full Warna" icon={<Flame size={20} className="text-orange-500" />} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 mt-4 px-4 sm:px-6">
                {data.berwarna.slice(0, 10).map((c: any, i: number) => (
                  <Link href={`/comic/detail/${c.slug}`} key={i} className="bg-[#1C1D2A] rounded-xl flex flex-col group">
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-xl">
                      <img src={`/api/image-proxy?url=${encodeURIComponent(c.image || c.poster || c.thumbnail)}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                        Full Color
                      </div>
                    </div>
                    <div className="p-3 bg-[#1C1D2A] rounded-b-xl z-10 flex-1 flex flex-col justify-between">
                      <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 leading-snug">{c.title}</h3>
                      <p className="text-blue-400 text-[10px] sm:text-xs font-bold mt-1">{c.chapter}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Webtoon Populer Section */}
          {data.webtoons && data.webtoons.length > 0 && (
            <section className="mt-6 mb-2">
              <div className="px-4 sm:px-6">
                <WidgetTitle title="Webtoon Populer" href="/explore?source=webtoons" />
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4 sm:px-6 mt-4">
                {data.webtoons.map((item: any, i: number) => (
                  <Link href={`/detail?url=${encodeURIComponent(item.url)}&source=webtoons`} key={i} className="flex-none w-[150px] sm:w-[180px] bg-[#1C1D2A] rounded-xl flex flex-col relative group">
                    <div className="relative w-full aspect-[3/4]">
                      <div className="w-full h-full rounded-t-xl overflow-hidden">
                        <img src={`/api/image-proxy?url=${encodeURIComponent(item.thumbnail)}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+' }} />
                      </div>
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Webtoon</div>
                      <div className="absolute -bottom-3 left-2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md z-10 flex items-center gap-1">
                        <Flame size={10} /> {item.likes || 'Top'}
                      </div>
                    </div>
                    <div className="p-3 pt-5 flex-1 flex flex-col justify-between bg-[#1C1D2A] rounded-b-xl z-0">
                      <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug mb-2">{item.title}</h3>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {item.rating || '9.0'}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> Update</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
            {/* 5. Rekomendasi Populer */}
            {data.popular.length > 0 && (
              <section className="mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                    Rekomendasi Populer
                  </h2>
                  <Link href="/comic/list?sort=populer" className="text-xs text-yellow-500 font-medium hover:text-yellow-400 transition-colors">Lihat Semua →</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-4">
                  {data.popular.slice(0, 10).map((c: any, i: number) => (
                    <Link href={`/comic/detail/${c.slug}`} key={i} className="flex-none w-[150px] sm:w-[180px] bg-[#1C1D2A] rounded-xl flex flex-col relative">
                      <div className="relative w-full aspect-[3/4]">
                        <div className="w-full h-full rounded-t-xl overflow-hidden">
                          <img src={`/api/image-proxy?url=${encodeURIComponent(c.thumbnail || c.poster || c.image)}`} alt={c.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+'} } />
                        </div>
                        <div className={`absolute top-2 left-2 ${c.type?.toLowerCase() === 'manhua' ? 'bg-emerald-500' : c.type?.toLowerCase() === 'manga' ? 'bg-blue-500' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>
                          {c.type || 'Manhwa'}
                        </div>
                        <div className="absolute -bottom-3 left-2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md z-10">
                          {c.chapter || 'Chapter ?'}
                        </div>
                      </div>
                      <div className="p-3 pt-5 flex-1 flex flex-col justify-between bg-[#1C1D2A] rounded-b-xl z-0">
                        <h3 className="text-white font-bold text-sm line-clamp-2 leading-snug mb-2">{c.title}</h3>
                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {c.rating || '9.0'}</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {c.description?.replace('Update ', '') || '4h ago'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 6. Update Terbaru */}
            {data.latest.length > 0 && (
              <section className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    Update Terbaru
                  </h2>
                  <Link href="/comic/pustaka" className="text-xs text-blue-400 font-medium hover:text-blue-300 transition-colors">Lihat Semua →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
                  {data.latest.map((c: any, i: number) => (
                    <Link href={`/comic/detail/${c.slug}`} key={i} className="bg-[#1C1D2A] rounded-xl flex flex-col relative group">
                      <div className="relative w-full aspect-[3/4]">
                        <div className="w-full h-full rounded-t-xl overflow-hidden">
                          <img src={`/api/image-proxy?url=${encodeURIComponent(c.thumbnail || c.poster || c.image)}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+'} } />
                        </div>
                        <div className={`absolute top-2 left-2 ${c.type?.toLowerCase() === 'manhua' ? 'bg-emerald-500' : c.type?.toLowerCase() === 'manga' ? 'bg-blue-500' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>
                          {c.type || 'Manhwa'}
                        </div>
                        <div className="absolute -bottom-3 left-2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md transition-transform group-hover:-translate-y-1 z-10">
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
                  ))}
                </div>
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
