// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Eye, Heart, Film, Calendar, Building2, Play, Bookmark, List, Copy, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getAnimeDetail, getAnimeOngoing } from '@/lib/anime-api';
import CommentSection from '../../../components/CommentSection';
import { useAuth } from '../../../components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [epsSortAsc, setEpsSortAsc] = useState(false);
  const [epsQuery, setEpsQuery] = useState('');
  const [epsPage, setEpsPage] = useState(1);
  const itemsPerPage = 30;
  const [rekomendasi, setRekomendasi] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const bookmarksStr = localStorage.getItem('valora_bookmarks');
      if (bookmarksStr) {
        const bookmarks = JSON.parse(bookmarksStr);
        setIsBookmarked(bookmarks.some((b: any) => b.novelUrl === `/anime/detail/${slug}`));
      }
    } catch(e) {}
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const fetchDetail = async () => {
      try {
        const res = await getAnimeDetail(slug);
        setDetail(res?.data || res?.anime_detail || res);
      } catch (error) {
        console.error("Failed to fetch anime detail", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchRek = async () => {
      try {
        const res = await getAnimeOngoing(1);
        const items = res?.animeList || res?.data || res || [];
        const arr = Array.isArray(items) ? items : [];
        const randoms = [...arr].sort(() => 0.5 - Math.random()).slice(0, 4);
        setRekomendasi(randoms);
      } catch (e) { }
    };

    fetchDetail();
    fetchRek();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen pt-16 text-white p-4 flex flex-col items-center justify-center">
        <p className="text-zinc-500 mb-4">Anime tidak ditemukan.</p>
        <button onClick={() => router.back()} className="text-[#60a5fa] hover:underline">Kembali</button>
      </div>
    );
  }

  let episodes = detail.episodeList || detail.episode_list || detail.episodes || [];
  
  // Sorting episodes
  const displayedEpisodes = [...episodes].reverse(); // default is from latest, let's reverse if requested
  if (epsSortAsc) {
    displayedEpisodes.reverse(); 
  }
  
  const filteredEpisodes = displayedEpisodes.filter((ep: any) => 
    (ep.title || ep.episode || '').toLowerCase().includes(epsQuery.toLowerCase())
  );
  
  const totalEpsPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const paginatedEpisodes = filteredEpisodes.slice((epsPage - 1) * itemsPerPage, epsPage * itemsPerPage);
  const startEps = (epsPage - 1) * itemsPerPage + 1;
  const endEps = Math.min(epsPage * itemsPerPage, filteredEpisodes.length);

  let synopsisText = "Tidak ada sinopsis.";
  if (typeof detail.synopsis === 'string') {
    synopsisText = detail.synopsis;
  } else if (detail.synopsis && detail.synopsis.paragraphs) {
    synopsisText = detail.synopsis.paragraphs.join("\n\n");
  }
  const isSynopsisLong = synopsisText.length > 200;

  return (
    <div className="min-h-screen pt-16 text-white pb-24 font-sans">
      

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center pt-8 px-4 sm:px-6">
        {/* POSTER */}
        <div className="w-32 sm:w-48 lg:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,153,187,0.15)] mb-6">
          <img 
            src={`/api/image-proxy?url=${encodeURIComponent(detail.poster || detail.thumb)}`} 
            alt={detail.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* TITLES */}
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-2 leading-tight">
          {detail.title}
        </h1>
        <p className="text-sm text-zinc-400 text-center mb-5">
          {detail.japanese || detail.title}
        </p>

        {/* STATS */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-[#2A2B3D] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold">
            <Eye size={14} className="text-[#60a5fa]" />
            <span className="text-zinc-300">530.403 Views</span>
          </div>
          <div className="bg-[#2A2B3D] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold">
            <Heart size={14} className="text-[#60a5fa] fill-current" />
            <span className="text-zinc-300">16759 Favs</span>
          </div>
        </div>

        {/* INFO TAGS */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <span className="bg-[#2A2B3D] border border-zinc-700/50 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Film size={14} /> SERIES
          </span>
          <span className="bg-[#5c3e58] text-[#60a5fa] text-xs font-bold px-3 py-1.5 rounded-full uppercase">
            {detail.status || 'FINISHED'}
          </span>
          <span className="bg-[#2a3457] text-[#8fb3ff] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Calendar size={14} /> {detail.release_date || detail.aired || '2019-07-08'}
          </span>
          <span className="bg-[#2a3457] text-[#8fb3ff] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Calendar size={14} /> {detail.year || '2024'}
          </span>
        </div>

        {/* STUDIO */}
        <div className="flex justify-center mb-5">
          <span className="bg-[#214a38] text-[#81e8b5] text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
            <Building2 size={14} /> {detail.studio || 'White Fox'}
          </span>
        </div>

        {/* GENRES */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {(detail.genre_list || []).map((g: any, i: number) => (
            <Link key={i} href={`/anime/genre/${g.genreId || g.slug}`} className="bg-[#2A2B3D] text-zinc-300 hover:text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors">
              {g.genreName || g.name}
            </Link>
          ))}
        </div>

        {/* SYNOPSIS */}
        <div className="w-full text-center mb-8">
          <div className="text-zinc-400 text-sm leading-relaxed mb-2 text-left space-y-3 whitespace-pre-wrap">
            {showFullSynopsis ? synopsisText : synopsisText.slice(0, 200) + (isSynopsisLong ? '...' : '')}
          </div>
          {isSynopsisLong && (
            <button onClick={() => setShowFullSynopsis(!showFullSynopsis)} className="text-[#60a5fa] text-sm font-bold hover:underline">
              {showFullSynopsis ? 'Sembunyikan' : 'Lihat Selengkapnya'}
            </button>
          )}
        </div>

        {/* MAIN BUTTONS */}
        <div className="w-full flex justify-center gap-4 mb-10">
          <Link href={episodes.length > 0 ? `/anime/watch/${episodes[episodes.length - 1]?.episodeId || episodes[episodes.length - 1]?.slug}` : '#'} className="bg-[#60a5fa] hover:bg-[#3b82f6] text-[#2c131b] font-extrabold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors min-w-[140px] text-sm justify-center">
            <Play size={16} className="fill-current" /> Lanjut Eps {episodes.length > 0 ? 1 : 0}
          </Link>
          <button 
            onClick={async () => {
              try {
                const bookmarksStr = localStorage.getItem('valora_bookmarks');
                let bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];
                if (isBookmarked) {
                  bookmarks = bookmarks.filter((b: any) => b.novelUrl !== `/anime/detail/${slug}`);
                  setIsBookmarked(false);
                  if (user) await supabase.from('user_bookmarks').delete().match({ user_id: user.id, item_url: `/anime/detail/${slug}` });
                } else {
                  bookmarks.unshift({
                    novelUrl: `/anime/detail/${slug}`,
                    title: detail.title,
                    thumbnail: detail.poster || detail.thumb,
                    category: 'Anime',
                    timestamp: Date.now()
                  });
                  setIsBookmarked(true);
                  if (user) await supabase.from('user_bookmarks').upsert({ user_id: user.id, item_url: `/anime/detail/${slug}`, title: detail.title, poster: detail.poster || detail.thumb, category: 'Anime' }, { onConflict: 'user_id,item_url' });
                }
                localStorage.setItem('valora_bookmarks', JSON.stringify(bookmarks));
              } catch(e) {}
            }}
            className={`font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors min-w-[140px] text-sm justify-center ${isBookmarked ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#2A2B3D] hover:bg-[#3b3c54] text-white'}`}>
            <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} /> {isBookmarked ? 'Hapus Watchlist' : 'Watchlist'}
          </button>
        </div>

        {/* EPISODE LIST */}
        <div className="w-full mb-10">
          <h3 className="text-xl font-bold text-[#60a5fa] mb-4 flex items-center gap-2 justify-center sm:justify-start">
            <List size={24} /> Episode (Series)
          </h3>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder={`Cari eps (1-${episodes.length})`}
                value={epsQuery}
                onChange={(e) => { setEpsQuery(e.target.value); setEpsPage(1); }}
                className="w-full bg-[#1C1D2A] border border-zinc-800 text-white text-sm rounded-lg pl-9 pr-16 py-2 focus:outline-none focus:border-zinc-600"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 bg-[#2A2B3D] text-xs font-bold rounded-lg text-[#60a5fa] hover:bg-[#3b3c54]">Cari</button>
            </div>
            <button onClick={() => setEpsSortAsc(!epsSortAsc)} className="bg-[#2A2B3D] hover:bg-[#3b3c54] border border-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0">
              Urutan: {epsSortAsc ? '1 -> 99' : '99 -> 1'}
            </button>
            <button className="bg-[#2A2B3D] hover:bg-[#3b3c54] border border-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0">
              <Copy size={14} /> Salin
            </button>
          </div>

          {/* Pagination Controls */}
          {totalEpsPages > 1 && (
            <div className="flex items-center justify-between bg-[#1C1D2A] border border-zinc-800/60 rounded-xl p-3 mb-4">
              <button 
                onClick={() => setEpsPage(p => Math.max(1, p - 1))} 
                disabled={epsPage === 1}
                className="text-zinc-400 hover:text-white p-2 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-zinc-300 text-xs font-bold">Page <span className="text-[#60a5fa]">{epsPage}</span></span>
                <span className="text-zinc-500 text-[10px]">Eps {startEps} - {endEps}</span>
              </div>
              <button 
                onClick={() => setEpsPage(p => Math.min(totalEpsPages, p + 1))} 
                disabled={epsPage === totalEpsPages}
                className="text-zinc-400 hover:text-white p-2 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
            {paginatedEpisodes.map((ep: any, i: number) => {
              // Extract episode number from string if possible
              const titleStr = String(ep.title || ep.episode || '');
              const match = titleStr.match(/\d+/);
              const epNum = match ? match[0] : (episodes.length - ((epsPage - 1) * itemsPerPage + i));
              return (
                <Link key={i} href={`/anime/watch/${ep.episodeId || ep.slug}`} className="bg-[#2A2B3D] hover:bg-[#3b3c54] rounded-xl flex flex-col items-center justify-center py-2.5 gap-0.5 border border-zinc-800/50 transition-colors">
                  <span className="text-[10px] font-bold text-zinc-400">EP</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{epNum}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="w-full mb-10">
          <CommentSection slug={slug} type="anime" />
        </div>

        {/* REKOMENDASI */}
        {rekomendasi.length > 0 && (
          <div className="w-full mb-10">
            <h3 className="text-xl font-bold text-[#60a5fa] mb-4 flex items-center gap-2">
              <Film size={24} /> Rekomendasi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {rekomendasi.map((item, i) => (
                <Link key={i} href={`/anime/detail/${item.animeId || item.id || item.slug || item.endpoint}`} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#2A2B3D] mb-2 relative">
                    <img src={`/api/image-proxy?url=${encodeURIComponent(item.poster || item.thumb)}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 bg-[#60a5fa] text-blue-950 text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow-sm uppercase">SERIES</div>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-2">{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
