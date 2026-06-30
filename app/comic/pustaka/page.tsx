'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Library, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';

export default function PustakaPage() {
  const router = useRouter();
  const [comics, setComics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalComics, setTotalComics] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  useEffect(() => {
    // Fetch total stats once
    fetch('/api/comic/stats')
      .then(res => res.json())
      .then(json => {
        if (json?.totalComics) setTotalComics(json.totalComics);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPustaka = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comic/pustaka/${page}`);
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
        else if (json?.results && Array.isArray(json.results)) raw = json.results;
        else if (json?.data?.results && Array.isArray(json.data.results)) raw = json.data.results;
        else if (json?.data?.records && Array.isArray(json.data.records)) raw = json.data.records;
        else if (json?.data && Array.isArray(json.data)) raw = json.data;

        const parsed = raw.map((c: any) => ({ ...c, slug: c.slug || parseSlug(c.link || c.href || c.url || '') }));
        
        setComics(parsed);
        if (parsed.length > itemsPerPage) setItemsPerPage(parsed.length);
      } catch (error) {
        console.error("Failed to fetch pustaka:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPustaka();
  }, [page]);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = totalComics > 0 ? Math.ceil(totalComics / itemsPerPage) : Math.max(page + 1, 100);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
    <div className="flex-1 min-w-0">
    <div className="min-h-screen bg-[#0D0D11] pb-24 font-sans text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2">
            <Library size={18} className="text-blue-500" /> Pustaka Komik
          </h1>
          <p className="text-zinc-500 text-[10px]">
            {totalComics > 0 ? `${totalComics.toLocaleString()} Komik` : 'Loading Stats...'}
          </p>
        </div>
        <div className="w-9" />
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 mt-4 text-sm">Memuat pustaka...</p>
          </div>
        ) : comics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Library size={48} className="mb-4 opacity-30" />
            <p>Tidak ada komik di halaman ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
              {comics.map((c: any, i: number) => (
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
                    {c.chapter && (
                      <div className="absolute -bottom-3 left-2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-md transition-transform group-hover:-translate-y-1 z-10">
                        {c.chapter}
                      </div>
                    )}
                  </div>
                  <div className="p-3 pt-5 flex-1 flex flex-col justify-between bg-[#1C1D2A] rounded-b-xl z-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm line-clamp-2 leading-snug mb-2">{c.title}</h3>
                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-zinc-400">
                      {c.rating && <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500 fill-yellow-500" /> {c.rating}</span>}
                      {c.description && <span className="flex items-center gap-1"><Clock size={10} /> {c.description.replace('Update ', '')}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Remote (Server-side) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                {getPageNumbers().map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`ellipsis-${i}`} className="text-zinc-500 px-0.5 sm:px-1 text-[10px] sm:text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                        page === p
                          ? 'bg-blue-600 text-white scale-110'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-center text-zinc-600 text-[10px] mt-3">
              Halaman {page} dari {totalPages}
            </p>
          </>
        )}
      </div>
    </div>
    </div>
    <Sidebar />
    </>
  );
}
