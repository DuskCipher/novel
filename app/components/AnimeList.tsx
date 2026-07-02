import Link from 'next/link';
import { Clock, Film } from 'lucide-react';

export default function AnimeList({ items }: { items: any[] }) {
  if (!items || items.length === 0) {
    return <div className="text-center p-8 text-zinc-500 font-medium">Data tidak tersedia</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 px-2 sm:px-0 mb-8 max-w-[1200px] mx-auto">
      {items.map((item, idx) => {
        const isOngoing = item.status?.toLowerCase() === 'ongoing';
        const isCompleted = item.status?.toLowerCase() === 'completed';
        
        return (
          <Link key={idx} href={item.href || `/detail?url=${encodeURIComponent(item.url)}`} className="group flex flex-col gap-2 relative">
            <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50 shadow-md group-hover:border-amber-500/30 transition-colors">
              {item.poster || item.thumbnail ? (
                <img 
                  src={(item.poster || item.thumbnail).startsWith('/') || (item.poster || item.thumbnail).startsWith('data:') ? (item.poster || item.thumbnail) : `/api/image-proxy?url=${encodeURIComponent(item.poster || item.thumbnail)}`} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22600%22%20fill%3D%22%2327272a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%2371717a%22%3ENot%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-[#1A1A22]">No Image</div>
              )}
              
              {/* Top Right: Status Badge & Type */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                {(isOngoing || isCompleted || item.status) && (
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border ${
                    isOngoing ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-md' : 
                    isCompleted ? 'bg-sky-500/20 text-sky-400 border-sky-500/30 backdrop-blur-md' : 
                    'bg-zinc-800/50 text-zinc-300 border-zinc-700/50 backdrop-blur-md'
                  }`}>
                    {isOngoing && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>}
                    {isOngoing ? 'ONGOING' : isCompleted ? 'TAMAT' : item.status.toUpperCase()}
                  </div>
                )}
                
                {item.type && (
                  <div className="bg-black/60 backdrop-blur-md text-white/90 border border-white/10 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center">
                    {item.type}
                  </div>
                )}
              </div>

              {/* Bottom Gradient Area for Details (Episodes, Time, Rating) */}
              <div className="absolute bottom-0 left-0 right-0 pt-12 pb-2 px-2 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end z-10">
                <div className="flex items-end justify-between w-full">
                  <div className="flex flex-col gap-0.5">
                    {/* Rating */}
                    {(item.rating || item.score || item.likes) && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                        <span className="text-[9px]">⭐</span> {item.rating || item.score || item.likes}
                      </div>
                    )}
                    {/* Episodes / Time */}
                    {(item.episodes || item.episode || item.time) && (
                      <div className="flex items-center gap-1 text-[9px] font-medium text-zinc-300">
                        {item.time ? <Clock size={9} className="text-zinc-400" /> : <Film size={9} className="text-zinc-400" />}
                        <span className="truncate max-w-[100px]">{item.time || (item.episodes || item.episode)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
            <h3 className="text-[11px] sm:text-xs font-bold text-zinc-200 line-clamp-2 group-hover:text-amber-500 transition-colors mt-1 leading-tight">
              {item.title}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
