import Link from 'next/link';
import { Clock } from 'lucide-react';

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
            <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden bg-zinc-900 shadow-md">
              {item.poster || item.thumbnail ? (
                <img 
                  src={(item.poster || item.thumbnail).startsWith('/') || (item.poster || item.thumbnail).startsWith('data:') ? (item.poster || item.thumbnail) : `/api/image-proxy?url=${encodeURIComponent(item.poster || item.thumbnail)}`} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22600%22%20fill%3D%22%2327272a%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%2371717a%22%3ENot%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-[#1A1A22]">No Image</div>
              )}
              
              {/* Top Left Badge: Status */}
              {(isOngoing || isCompleted || item.status) && (
                <div className={`absolute top-1 left-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10 ${
                  isOngoing ? 'bg-emerald-500 text-white' : 
                  isCompleted ? 'bg-blue-500 text-white' : 
                  'bg-zinc-800 text-zinc-300'
                }`}>
                  {isOngoing ? 'Ongoing' : isCompleted ? 'Completed' : item.status}
                </div>
              )}

              {/* Top Right Badge: Time OR Episodes */}
              {item.time ? (
                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-md text-pink-400 border border-pink-500/20 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow flex items-center gap-1 z-10">
                  <Clock size={10} /> at {item.time}
                </div>
              ) : item.episodes ? (
                <div className="absolute top-1 right-1 bg-amber-600/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow z-10">
                  {item.episodes}
                </div>
              ) : null}

              {/* Bottom Badge: Rating */}
              {(item.rating || item.likes) && (
                <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                  ⭐ {item.rating || item.likes}
                </div>
              )}
            </div>
            <h3 className="text-[11px] sm:text-xs font-bold text-zinc-200 line-clamp-2 group-hover:text-amber-500 transition-colors mt-1">
              {item.title}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
