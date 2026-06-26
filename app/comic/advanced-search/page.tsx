'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Form states
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('update');

  useEffect(() => {
    // Fetch genres for the filter dropdown
    fetch('/api/comic/genres')
      .then(r => r.json())
      .then(json => {
        if (json?.data && Array.isArray(json.data)) setGenres(json.data);
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedOrder) params.append('order', selectedOrder);

      // We'll proxy through our existing search endpoint
      // The API endpoint on sankavollerei is /comic/search
      const res = await fetch(`/api/comic/search?${params.toString()}`);
      const json = await res.json();

      const parseSlug = (link: string) => {
        if (!link) return '';
        if (link.startsWith('/')) {
          const m = link.match(/\/manga\/([^/]+)/);
          if (m) return m[1];
          return link.replace(/^\/|\/$/g, '');
        }
        const urlMatch = link.match(/\/manga\/([^/]+)/);
        return urlMatch ? urlMatch[1] : link;
      };

      let raw: any[] = [];
      if (Array.isArray(json)) raw = json;
      else if (json?.comics && Array.isArray(json.comics)) raw = json.comics;
      else if (json?.data && Array.isArray(json.data)) raw = json.data;
      else if (json?.results && Array.isArray(json.results)) raw = json.results;

      const parsed = raw.map((c: any) => ({ ...c, slug: c.slug || parseSlug(c.link || c.href || c.url || '') }));
      setResults(parsed);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D11] pb-24 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors shrink-0">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-sm sm:text-base flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-pink-500" /> Pencarian Spesifik
        </h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-8">
        
        {/* Filter Panel */}
        <div className="w-full md:w-72 shrink-0">
          <form onSubmit={handleSearch} className="bg-[#151728] border border-zinc-800 rounded-2xl p-5 sticky top-24">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FilterIcon /> Filter Komik
            </h2>

            {/* Keyword */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Kata Kunci</label>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul..."
                className="w-full bg-[#0D0D11] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Tipe */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tipe</label>
              <select 
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full bg-[#0D0D11] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none"
              >
                <option value="">Semua Tipe</option>
                <option value="manga">Manga (Jepang)</option>
                <option value="manhwa">Manhwa (Korea)</option>
                <option value="manhua">Manhua (China)</option>
              </select>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
              <select 
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full bg-[#0D0D11] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none"
              >
                <option value="">Semua Status</option>
                <option value="ongoing">Sedang Berjalan</option>
                <option value="completed">Tamat</option>
              </select>
            </div>

            {/* Urutan */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Urutkan Berdasarkan</label>
              <select 
                value={selectedOrder}
                onChange={e => setSelectedOrder(e.target.value)}
                className="w-full bg-[#0D0D11] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none"
              >
                <option value="update">Update Terbaru</option>
                <option value="popular">Terpopuler</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="title">A-Z Judul</option>
              </select>
            </div>

            {/* Genre */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Genre</label>
              <select 
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="w-full bg-[#0D0D11] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none"
              >
                <option value="">Semua Genre</option>
                {genres.map(g => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-pink-600/20">
              <Search size={18} /> Cari Komik
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="flex-1 min-w-0">
          {!hasSearched ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
              <Search size={48} className="mb-4 opacity-30" />
              <p>Atur filter di samping untuk mencari komik spesifik.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
              <p>Tidak ada komik yang sesuai dengan filter.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Hasil Pencarian</h2>
                <span className="text-zinc-500 text-xs">{results.length} komik ditemukan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {results.map((c: any, i: number) => (
                  <Link href={`/comic/detail/${c.slug}`} key={i} className="bg-[#1C1D2A] rounded-xl flex flex-col relative group overflow-hidden">
                    <div className="relative w-full aspect-[3/4]">
                      <div className="w-full h-full rounded-t-xl overflow-hidden">
                        <img
                          src={`/api/image-proxy?url=${encodeURIComponent(c.thumbnail || c.poster || c.image || '')}`}
                          alt={c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwIDMwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMxNTE3MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5Ob3QgRm91bmQ8L3RleHQ+PC9zdmc+'; }}
                        />
                      </div>
                      {c.type && (
                        <div className={`absolute top-2 left-2 ${c.type.toLowerCase() === 'manhua' ? 'bg-emerald-500' : c.type.toLowerCase() === 'manga' ? 'bg-blue-500' : 'bg-red-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase`}>
                          {c.type}
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-[#1C1D2A] rounded-b-xl z-10 flex-1 flex flex-col justify-between">
                      <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 leading-snug mb-2">{c.title}</h3>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-400">
                        {c.rating && <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {c.rating}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  );
}
