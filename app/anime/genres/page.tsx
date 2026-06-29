'use client';

import { useState, useEffect } from 'react';
import { Layers, Search } from 'lucide-react';
import { getAnimeGenres } from '@/lib/anime-api';
import AnimeCard3 from '../components/AnimeCard3';
import Sidebar from '../../components/Sidebar';

export default function AnimeGenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getAnimeGenres();
        let items = res?.data?.genreList || res?.genreList || res?.genre_list;
        if (!items) {
          items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        }
        setGenres(items);
      } catch (error) {
        console.error("Failed to fetch genres", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const tabs = ['Semua', 'Genre', 'Theme', 'Demographic'];

  const filteredGenres = genres.filter(g => {
    const name = (g.title || g.name || '').toLowerCase();
    if (searchQuery && !name.includes(searchQuery.toLowerCase())) return false;
    // We don't have actual categories from the API usually, so just show all for now
    return true;
  });

  return (
    <>
      <div className="flex-1 flex flex-col min-h-screen text-white pb-24 font-sans w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#2A2B3D] flex items-center justify-center">
          <Layers size={24} className="text-[#60a5fa]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-zinc-400 tracking-wider">KATEGORI</span>
          <h1 className="text-2xl font-bold text-white">Daftar Genre</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Cari genre..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1C1D2A] border border-zinc-800 text-white text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-zinc-600 shadow-sm"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 flex items-center px-4 py-2 rounded-full font-bold text-xs transition-colors ${
                isActive 
                  ? 'bg-[#60a5fa] text-blue-950 shadow-md' 
                  : 'bg-[#2A2B3D] text-zinc-300 hover:bg-[#3b3c54]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredGenres.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">Tidak ada genre ditemukan.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredGenres.map((g, i) => (
              <AnimeCard3 
                key={i}
                item={g}
                href={`/anime/genre/${g.genreId || g.slug || g.id}`}
                type="genre"
              />
            ))}
          </div>
        )}
      </div>
    </div>
    <Sidebar />
    </>
  );
}
