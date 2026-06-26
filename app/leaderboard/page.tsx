'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Trophy, Medal, Crown, Star, Shield, Loader2, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';

// Helper: tentukan tier berdasarkan level (Sama dengan komentar)
function getUserTier(level: number) {
  if (level >= 100) return { name: 'Mythic', icon: Crown, color: 'from-rose-500 via-purple-500 to-indigo-500', text: 'text-rose-500 dark:text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-500/10 dark:bg-rose-500/20', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]', effect: 'animate-pulse border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)]' };
  if (level >= 50)  return { name: 'Legend', icon: Crown, color: 'from-amber-400 via-yellow-500 to-orange-500', text: 'text-amber-500 dark:text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10 dark:bg-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]', effect: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' };
  if (level >= 30)  return { name: 'Elite', icon: Sparkles, color: 'from-cyan-400 to-blue-500', text: 'text-cyan-500 dark:text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10 dark:bg-cyan-500/15', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]', effect: '' };
  if (level >= 10)  return { name: 'Veteran', icon: Shield, color: 'from-emerald-400 to-green-500', text: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', glow: '', effect: '' };
  return null;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = users.slice(0, 3);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown size={28} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
      case 1: return <Medal size={26} className="text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.6)]" />;
      case 2: return <Medal size={24} className="text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.6)]" />;
      default: return <span className="font-black text-xl text-zinc-500">#{index + 1}</span>;
    }
  };

  const PodiumUser = ({ user, rank }: { user: any, rank: number }) => {
    if (!user) return <div className="flex-1"></div>;
    const isFirst = rank === 1;
    const tier = getUserTier(user.level);
    const TierIcon = tier?.icon || Star;
    
    // Ukuran avatar dan tinggi podium per rank
    const avatarSize = isFirst ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-18 h-18 sm:w-22 sm:h-22';
    const podiumHeight = isFirst ? 'h-36 sm:h-44' : rank === 2 ? 'h-28 sm:h-36' : 'h-24 sm:h-32';
    
    // Warna tema khusus per rank
    const theme = isFirst 
      ? { border: 'border-yellow-400', glow: 'drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]', cardBg: 'bg-gradient-to-b from-yellow-500/25 via-yellow-600/10 to-zinc-900', cardBorder: 'border-yellow-500/40' }
      : rank === 2 
        ? { border: 'border-zinc-300', glow: 'drop-shadow-[0_0_10px_rgba(212,212,216,0.3)]', cardBg: 'bg-gradient-to-b from-zinc-400/20 via-zinc-500/10 to-zinc-900', cardBorder: 'border-zinc-400/40' }
        : { border: 'border-amber-600', glow: 'drop-shadow-[0_0_10px_rgba(217,119,6,0.3)]', cardBg: 'bg-gradient-to-b from-amber-600/25 via-amber-700/10 to-zinc-900', cardBorder: 'border-amber-600/40' };

    return (
      <div className={`flex flex-col items-center ${isFirst ? 'z-20 order-2 mx-[-8px]' : rank === 2 ? 'z-10 order-1' : 'z-10 order-3'}`} style={{ flex: isFirst ? '1.15' : '1' }}>
        {/* Medal/Crown icon */}
        <div className="mb-1.5">
          {isFirst && <Crown size={36} className={`text-yellow-400 animate-bounce ${theme.glow}`} />}
          {rank === 2 && <Medal size={28} className={`text-zinc-300 ${theme.glow}`} />}
          {rank === 3 && <Medal size={28} className={`text-amber-600 ${theme.glow}`} />}
        </div>
        
        {/* Avatar */}
        <div className={`relative ${avatarSize} rounded-full overflow-hidden border-[3px] ${theme.border} ${theme.glow} bg-zinc-900 shrink-0`}>
          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/avatar.jpeg'; }} />
        </div>
        
        {/* Card podium - overlaps avatar slightly */}
        <div className={`w-full ${podiumHeight} -mt-5 pt-7 px-2 sm:px-3 rounded-t-2xl ${theme.cardBg} border ${theme.cardBorder} border-b-0 flex flex-col items-center gap-1.5 overflow-hidden shadow-xl`}>
          {/* Nama */}
          <p className="font-black text-xs sm:text-sm text-white truncate w-full text-center leading-tight" title={user.displayName}>
            {user.displayName}
          </p>
          
          {/* Level Badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
             tier ? `bg-gradient-to-r ${tier.color} text-white shadow-md` : 'bg-zinc-800 text-zinc-300'
          }`}>
             <TierIcon size={11} /> Lv.{user.level}
          </span>
          
          {/* EXP */}
          <span className="text-[10px] sm:text-xs font-bold text-amber-400/90 tracking-wide flex items-center gap-1 whitespace-nowrap">
            <Sparkles size={10} />
            {user.exp.toLocaleString()} <span className="opacity-70 text-[8px]">XP</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 min-w-0 pb-10">
        {/* Header Mewah (Solid Gray) */}
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col items-center text-center">
          <div className="relative z-10 p-3 sm:p-4 bg-zinc-800 rounded-2xl mb-4 shadow-xl border border-zinc-700">
            <Trophy size={40} className="text-amber-400" />
          </div>
          <h1 className="relative z-10 text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Hall of Fame
          </h1>
          <p className="relative z-10 text-zinc-400 font-medium max-w-lg text-sm sm:text-base">
            Papan peringkat pahlawan paling aktif di Valora.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-amber-500 animate-spin mb-4" />
            <p className="text-zinc-500 font-medium animate-pulse">Menghitung Peringkat...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Shield size={48} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Belum ada pahlawan</h2>
            <p className="text-zinc-500">Jadilah yang pertama untuk memanjat peringkat!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Top 3 Podium */}
            {top3.length > 0 && !searchQuery && (
              <div className="flex items-end justify-center gap-2 sm:gap-4 px-4 sm:px-6 mt-10 mb-8 max-w-xl mx-auto w-full">
                <PodiumUser user={top3[1]} rank={2} />
                <PodiumUser user={top3[0]} rank={1} />
                <PodiumUser user={top3[2]} rank={3} />
              </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto w-full px-4 sm:px-0">
              <div className="absolute inset-y-0 left-4 sm:left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pahlawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>

            {/* List Rest of Users */}
            <div className="flex flex-col gap-3 mt-4">
              {filteredUsers.map((u, i) => {
                const globalIndex = users.findIndex(user => user.id === u.id);
                // Sembunyikan top 3 dari list bawah jika tidak sedang search
                if (!searchQuery && globalIndex < 3) return null;

                const isCurrentUser = currentUser?.id === u.id;
                const tier = getUserTier(u.level);
                const TierIcon = tier?.icon || Star;
                const isHighLevel = u.level >= 10;
                
                return (
                  <div 
                    key={u.id}
                    className={`relative flex items-center p-4 sm:p-5 rounded-2xl transition-all duration-300 overflow-hidden ${
                      isCurrentUser 
                        ? 'bg-zinc-800 border border-amber-500/50' 
                        : isHighLevel && tier 
                          ? `bg-zinc-900 border ${tier.border}` 
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {/* Animated background effects for high level */}
                    {isHighLevel && tier && u.level >= 50 && (
                      <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse pointer-events-none"></div>
                      </>
                    )}

                    <div className="w-12 sm:w-16 flex justify-center shrink-0 z-10">
                      {getRankIcon(globalIndex)}
                    </div>
                    
                    <div className="relative shrink-0 mx-3 sm:mx-5 z-10 flex items-center justify-center">
                      {/* Efek energi berputar (Muter) untuk avatar level 50+ */}
                      {isHighLevel && tier && u.level >= 50 && (
                        <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${tier.color} animate-[spin_3s_linear_infinite] blur-[3px] opacity-70`}></div>
                      )}
                      {/* Efek statis untuk level 10-49 */}
                      {isHighLevel && tier && u.level < 50 && (
                        <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${tier.color} opacity-50`}></div>
                      )}
                      
                      <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full ${isHighLevel && tier ? `p-[2.5px] bg-gradient-to-tr ${tier.color}` : 'border border-zinc-200 dark:border-zinc-700 shadow-md'}`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                          <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/avatar.jpeg'; }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 z-10">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`text-base sm:text-lg font-bold truncate max-w-[150px] sm:max-w-none ${
                          isHighLevel && tier ? tier.text : 'text-zinc-900 dark:text-white'
                        }`}>
                          {u.displayName}
                        </h3>
                        {isCurrentUser && <span className="text-[10px] uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full font-black">Kamu</span>}
                        {tier && (
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${tier.bg} ${tier.text} border ${tier.border}`}>
                            <TierIcon size={10} /> {tier.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 ${isHighLevel && tier ? tier.text : 'text-zinc-500'}`}>
                          <TierIcon size={14} className={isHighLevel && tier && u.level >= 50 ? 'animate-pulse' : ''} />
                          <span className="text-sm font-bold">Lv. {u.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Sparkles size={14} />
                          <span className="text-sm font-medium">{u.exp.toLocaleString()} EXP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredUsers.length === 0 && searchQuery && (
                <div className="text-center py-10">
                  <p className="text-zinc-500">Tidak ada pahlawan bernama "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Sidebar />
    </>
  );
}
