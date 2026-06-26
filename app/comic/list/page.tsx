'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { ArrowLeft, Star, Clock, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 20;

function ComicListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort');
  const status = searchParams.get('status');
  const genre = searchParams.get('genre');
  const type = searchParams.get('type');

  const [allComics, setAllComics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/comic/terbaru';

      if (sort === 'trending') {
        url = '/api/comic/trending';
      } else if (sort === 'populer' || sort === 'popular') {
        url = '/api/comic/populer';
      } else if (genre) {
        url = `/api/comic/genre/${genre}`;
      } else if (type) {
        url = `/api/comic/type/${type}`;
      } else if (status === 'completed') {
        url = '/api/comic/populer';
      } else if (status === 'ongoing') {
        url = '/api/comic/terbaru';
      }

      const res = await fetch(url);
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
      else if (json?.trending && Array.isArray(json.trending)) raw = json.trending;
      else if (json?.results && Array.isArray(json.results)) raw = json.results;
      else if (json?.data?.results && Array.isArray(json.data.results)) raw = json.data.results;
      else if (json?.data?.records && Array.isArray(json.data.records)) raw = json.data.records;
      else if (json?.data && Array.isArray(json.data)) raw = json.data;
      const parsed = raw.map((c: any) => ({ ...c, slug: c.slug || parseSlug(c.link || c.href || c.url || '') }));
      setAllComics(parsed);
      setPage(1);
    } catch (error) {
      console.error("Failed to fetch list:", error);
    } finally {
      setLoading(false);
    }
  }, [sort, status, genre, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  let pageTitle = 'Daftar Komik';
  if (sort === 'trending') pageTitle = 'Trending';
  else if (sort === 'populer' || sort === 'popular') pageTitle = 'Rekomendasi Populer';
  else if (status === 'completed') pageTitle = 'Komik Tamat';
  else if (status === 'ongoing') pageTitle = 'Komik Ongoing';
  else if (genre) pageTitle = `Genre: ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;
  else if (type) pageTitle = `Tipe: ${type.charAt(0).toUpperCase() + type.slice(1)}`;

  const totalPages = Math.max(1, Math.ceil(allComics.length / ITEMS_PER_PAGE));
  const paginated = allComics.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#0D0D11] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-sm sm:text-base">{pageTitle}</h1>
          {!loading && <p className="text-zinc-500 text-[10px]">{allComics.length} komik ditemukan</p>}
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 mt-4 text-sm">Memuat komik...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p>Tidak ada komik ditemukan.</p>
          </div>
        ) : (
          <>
            {/* Comic Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
              {paginated.map((c: any, i: number) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-6">
                {/* Prev button */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                {/* Page numbers */}
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

                {/* Next button */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <p className="text-center text-zinc-600 text-[10px] mt-3">
                Halaman {page} dari {totalPages} • Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, allComics.length)} dari {allComics.length} komik
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ComicListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D11]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ComicListContent />
    </Suspense>
  );
}
