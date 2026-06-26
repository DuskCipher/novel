'use client';

import { useState, useEffect } from 'react';
import WidgetTitle from '../components/WidgetTitle';
import AnimeList from '../components/AnimeList';
import Sidebar from '../components/Sidebar';

export default function DonghuaPage() {
  const [donghua, setDonghua] = useState<any>({ recent: [], completed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/donghua/home');
        const data = await res.json();
        if (data && !data.error) {
          setDonghua(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="flex-1 min-w-0">

        
        {loading ? (
          <div className="flex flex-col gap-8">
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {donghua.recent.length > 0 && (
              <div className="w-full h-48 sm:h-64 lg:h-80 relative rounded-2xl overflow-hidden bg-zinc-900 shadow-xl group">
                <img 
                  src={`/api/image-proxy?url=${encodeURIComponent(donghua.recent[0].poster)}`} 
                  alt="Featured" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 lg:p-8">
                  <span className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">EPISODE BARU</span>
                  <h2 className="text-2xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">{donghua.recent[0].title}</h2>
                  <a href={donghua.recent[0].href} className="inline-block mt-2 bg-white text-black hover:bg-amber-500 hover:text-white px-6 py-2.5 rounded-lg font-bold transition-colors">
                    Tonton Sekarang
                  </a>
                </div>
              </div>
            )}

            <section>
              <WidgetTitle title="Episode Terbaru" href="/donghua/ongoing" />
              <AnimeList items={donghua.recent.slice(0, 15)} />
            </section>

            <section>
              <WidgetTitle title="Donghua Tamat" href="/search?source=donghua" />
              <AnimeList items={donghua.completed.slice(0, 15)} />
            </section>
          </div>
        )}
      </div>
      <Sidebar />
    </>
  );
}
