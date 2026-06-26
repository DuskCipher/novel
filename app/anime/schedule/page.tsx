'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getAnimeSchedule } from '@/lib/anime-api';
import AnimeCard3 from '../components/AnimeCard3';
import Sidebar from '@/app/components/Sidebar';

export default function AnimeSchedulePage() {
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Semua');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await getAnimeSchedule();
        const items = res?.schedule || res?.data || res || [];
        setScheduleData(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const days = ['Semua', ...scheduleData.map(d => d.day)];
  const totalAnime = scheduleData.reduce((acc, curr) => acc + (curr.animeList?.length || curr.anime_list?.length || 0), 0);

  const filteredData = activeDay === 'Semua' 
    ? scheduleData 
    : scheduleData.filter(d => d.day === activeDay);

  return (
    <>
      <div className="flex-1 flex flex-col min-h-screen text-white pb-24 font-sans w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={28} className="text-[#60a5fa]" />
          <h1 className="text-2xl font-bold text-white">Jadwal Tayang</h1>
        </div>

        {/* Filter Pills */}
        <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 pb-2">
          {days.map((day, idx) => {
            const isActive = activeDay === day;
            const count = day === 'Semua' 
              ? totalAnime 
              : (scheduleData.find(d => d.day === day)?.animeList?.length || scheduleData.find(d => d.day === day)?.anime_list?.length || 0);
            
            return (
              <button
                key={idx}
                onClick={() => setActiveDay(day)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-transparent ${
                  isActive 
                    ? 'bg-[#60a5fa] text-blue-950 shadow-md border-[#60a5fa]' 
                    : 'bg-[#2A2B3D] text-zinc-300 hover:bg-[#3b3c54] border-zinc-700/50'
                }`}
              >
                {day}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-blue-950/20 text-blue-950' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : scheduleData.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">Jadwal tidak tersedia.</div>
          ) : (
            filteredData.map((dayData, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                {/* Day Header */}
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
                  <div className="w-1 h-6 bg-[#60a5fa] rounded-full"></div>
                  <h2 className="text-lg font-bold text-white">{dayData.day}</h2>
                </div>
                
                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {(dayData.animeList || dayData.anime_list || []).map((anime: any, i: number) => (
                    <AnimeCard3 
                      key={i}
                      item={anime}
                      href={`/anime/detail/${anime.animeId || anime.id || anime.slug || anime.endpoint}`}
                      type="schedule"
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Sidebar />
    </>
  );
}

