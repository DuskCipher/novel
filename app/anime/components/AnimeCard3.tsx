import Link from 'next/link';
import { Eye, Clock } from 'lucide-react';

interface AnimeCard3Props {
  item: any;
  href: string;
  type?: 'schedule' | 'movie' | 'explore' | 'genre';
  genreName?: string;
}

export default function AnimeCard3({ item, href, type = 'explore', genreName }: AnimeCard3Props) {
  const isSchedule = type === 'schedule';
  const isMovie = type === 'movie';
  const isGenre = type === 'genre';

  const title = item.title || item.anime_name || item.name || '';
  const poster = item.poster || item.thumb || item.thumbnail || '';
  
  if (isGenre) {
    return (
      <Link href={href} className="group relative block w-full aspect-[2/1] rounded-xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
          {/* We can use a pattern or just gradient for genre */}
          <div className="w-full h-full bg-gradient-to-l from-transparent to-zinc-950"></div>
        </div>
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#60a5fa]/20 text-[#60a5fa] text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-[#60a5fa]/30">
          GENRE
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-lg sm:text-xl drop-shadow-md truncate">{title}</h3>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group flex flex-col gap-2 relative w-full">
      <div className="w-full aspect-[3/4] relative rounded-xl overflow-hidden shadow-md border border-zinc-200 dark:border-zinc-800/50 bg-[#232330]">
        <img 
          src={`/api/image-proxy?url=${encodeURIComponent(poster)}`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = '/logo.png'; }}
        />

        {/* Top Left Badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-lg bg-[#60a5fa] text-blue-950 text-[9px] font-black uppercase shadow-sm z-10">
          {isMovie ? 'MOVIE' : 'SERIES'}
        </div>

        {/* Top Right Badge / Status */}
        {!isMovie && !isSchedule && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-emerald-500 text-emerald-950 text-[9px] font-black uppercase shadow-sm z-10">
            {item.status || 'ONGOING'}
          </div>
        )}
        
        {isSchedule && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-emerald-500 text-emerald-950 text-[9px] font-black uppercase shadow-sm z-10">
            ONGOING
          </div>
        )}
      </div>

      {/* Bottom Content / Outside Card */}
      <div className="flex flex-col px-0.5">
        <h3 className="font-bold text-[11px] sm:text-xs text-zinc-100 line-clamp-2 leading-tight mb-1 group-hover:text-[#60a5fa] transition-colors">{title}</h3>
        
        <div className="flex items-center justify-between mt-auto">
          {isSchedule ? (
            <>
              <span className="text-[10px] text-zinc-500 font-medium">SERIES</span>
              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                <Clock size={10} /> new !!
              </span>
            </>
          ) : isMovie ? (
            <>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TAMAT
              </span>
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Eye size={10} /> {item.views || Math.floor(Math.random() * 100000)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-zinc-500 font-medium">{item.year || '2024'}</span>
              <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                <Eye size={10} /> {item.views || Math.floor(Math.random() * 100000)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
