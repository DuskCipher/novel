// @ts-nocheck
'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  User, Info, Bell, ChevronRight, X, Loader2, Shield, 
  Smartphone, Globe, Heart, CheckCircle, AlertCircle, 
  PlayCircle, Book, FileText, Coffee, MessageCircle, 
  Crown, Search, Bookmark, History, Activity, ArrowLeft,
  Sparkles, Eye, Clock, Star, Users, Medal, Trophy, Palette, Pin, MonitorPlay
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'showcase' | 'aktivitas'>('ringkasan');
  const [visibleActivities, setVisibleActivities] = useState(10);
  const [isFollowing, setIsFollowing] = useState(false);

  // --- MOCK DATA FOR NEW FEATURES ---
  const mockStats = {
    watchTime: '12 Hari 5 Jam',
    episodesWatched: 1250,
    favoriteGenres: ['Action', 'Fantasy', 'Cultivation']
  };

  const mockSocial = {
    followers: 1240,
    following: 85
  };

  const mockBadges = [
    { id: 1, name: 'Marathoner', icon: '🏃', desc: 'Nonton 20 episode 1 hari' },
    { id: 2, name: 'Sekte Donghua', icon: '🗡️', desc: 'Pecinta Donghua' },
    { id: 3, name: 'First Blood', icon: '🩸', desc: 'Komentar Pertama' },
    { id: 4, name: 'Sepuh', icon: '🧙', desc: 'Telah mencapai Level 50+' }
  ];

  const mockTop10 = [
    { id: 1, title: 'Swallowed Star', image: 'https://i.pinimg.com/736x/ed/e9/ff/ede9ffc57dc4e0543e4983a54d6fc737.jpg', type: 'Donghua' },
    { id: 2, title: 'Battle Through The Heavens', image: 'https://i.pinimg.com/736x/8f/3e/30/8f3e306b3cc760a927a7b8e1f592a106.jpg', type: 'Donghua' },
    { id: 3, title: 'Perfect World', image: 'https://i.pinimg.com/736x/cc/21/fc/cc21fc82a6fce20fb26dbcc0b65671ab.jpg', type: 'Donghua' },
    { id: 4, title: 'Demon Slayer', image: 'https://i.pinimg.com/736x/1a/bf/f4/1abff49d0dd5d87fb08d484439c2741d.jpg', type: 'Anime' },
    { id: 5, title: 'Solo Leveling', image: 'https://i.pinimg.com/736x/a7/67/7b/a7677b102ef708c9095df0cece43e74c.jpg', type: 'Anime' }
  ];
  // ----------------------------------

  useEffect(() => {
    async function loadUser() {
      if (!userId) return;
      try {
        setLoading(true);
        // Ambil data profil
        const { data: profData, error: profError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        
        if (profError) {
          console.error("User not found", profError);
          setProfile({ error: profError.message, isError: true });
          setLoading(false);
          return;
        }
        
        setProfile(profData);

        // Ambil aktivitas terbaru
        const { data: actData } = await supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
        if (actData) {
          setActivities(actData);
        }

      } catch (e) {
        console.error("Load user error", e);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0D0D11]">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );
  }

  if (!profile || profile.isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen bg-[#0D0D11]">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-zinc-800">
          <User size={40} className="text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pengguna Tidak Ditemukan</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">Profil yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
        <Link href="/" className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Theme Handling (If the user saved a theme, otherwise default amber)
  const themeColor = profile.theme_color || 'amber';
  const getThemeColors = () => {
    switch (themeColor) {
      case 'blue': return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', from: 'from-blue-600', to: 'to-cyan-500', hover: 'hover:bg-blue-600' };
      case 'rose': return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', ring: 'ring-rose-500', from: 'from-rose-600', to: 'to-pink-500', hover: 'hover:bg-rose-600' };
      case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500', from: 'from-emerald-600', to: 'to-teal-500', hover: 'hover:bg-emerald-600' };
      case 'purple': return { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', ring: 'ring-purple-500', from: 'from-purple-600', to: 'to-indigo-500', hover: 'hover:bg-purple-600' };
      default: return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', ring: 'ring-amber-500', from: 'from-amber-600', to: 'to-orange-500', hover: 'hover:bg-amber-600' };
    }
  };
  const theme = getThemeColors();

  // User Stats
  const displayName = profile.display_name || 'Pengguna Tanpa Nama';
  const avatarUrl = profile.avatar_url || '/avatar.jpeg';
  const bannerUrl = profile.banner_url || '';
  const isVerified = profile.is_verified || false;
  const role = profile.role || 'User';
  const isSpecial = role === 'Developer' || role === 'Admin' || role === 'Moderator' || isVerified;
  const level = profile.level || 1;
  const currentExp = profile.exp || 0;
  const expNeeded = level * 100;
  const expPercentage = Math.min(100, Math.round((currentExp / expNeeded) * 100));
  const totalExp = ((level - 1) * 100) + currentExp; 
  const bio = profile.bio || 'Belum ada bio.';
  
  const rankNames = ['Rookie', 'Veteran', 'Elite', 'Legend', 'Mythic'];
  const currentRank = rankNames[Math.min(Math.floor(level / 20), rankNames.length - 1)];
  const nextRank = rankNames[Math.min(Math.floor(level / 20) + 1, rankNames.length - 1)];

  return (
    <div className="flex-1 min-w-0 pb-20 font-sans bg-[#0D0D11]">
      <div className="w-full">
        {/* Banner Section */}
        <div className="w-full h-48 sm:h-64 lg:h-80 bg-zinc-900 relative flex items-center justify-center overflow-hidden border-b border-zinc-800">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[#15151A] via-zinc-900 to-[#15151A]">
               <div className={`absolute inset-0 bg-gradient-to-r ${theme.from} opacity-10`}></div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/60 to-transparent z-10"></div>
          <Link href="/" className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-rose-500 transition-colors z-20">
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Profile Header */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 relative z-20 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0D0D11] bg-zinc-900 overflow-hidden relative shadow-2xl ring-2 ${theme.ring} ring-offset-4 ring-offset-[#0D0D11]`}>
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className={`absolute bottom-2 right-2 w-10 h-10 ${theme.bg} rounded-full border-4 border-[#0D0D11] flex items-center justify-center text-white shadow-lg`}>
              <Crown size={16} />
            </div>
          </div>

          {/* User Info & Socials */}
          <div className="flex-1 text-center sm:text-left mb-2 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                {displayName}
                {isSpecial && <CheckCircle size={24} className="text-blue-500 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
              </h1>
              
              {/* Badges */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded-md border border-zinc-700 shadow-sm flex items-center gap-1`}>
                  <Sparkles size={12} className={theme.text} /> Lv. {level}
                </span>
                <span className={`px-3 py-1 bg-gradient-to-r ${theme.from}/20 ${theme.to}/20 ${theme.text} text-[10px] font-bold rounded-md border ${theme.border}/30 shadow-sm flex items-center gap-1 uppercase tracking-wider`}>
                  {currentRank}
                </span>
              </div>
            </div>
            <p className="text-sm text-zinc-400 font-medium max-w-2xl line-clamp-2 mb-3">{bio}</p>
            
            {/* Social Connections */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="font-bold text-white">{mockSocial.followers + (isFollowing ? 1 : 0)}</span> Followers
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="font-bold text-white">{mockSocial.following}</span> Following
              </div>
              {currentUser && currentUser.id !== userId && (
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`ml-4 px-5 py-1.5 ${isFollowing ? 'bg-zinc-800 text-white border border-zinc-700' : `${theme.bg} ${theme.hover} text-white`} text-xs font-bold rounded-full transition-colors`}
                >
                  {isFollowing ? 'Mengikuti' : 'Ikuti (Follow)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR (TABS) */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-2 sticky top-24 shadow-xl">
              {[
                { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
                { id: 'showcase', label: 'Top Favorit', icon: Star },
                { id: 'aktivitas', label: 'Aktivitas Publik', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? `${theme.bg}/10 ${theme.text}` 
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? theme.text : 'text-zinc-500'} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 min-w-0">
            
            {/* TAB: RINGKASAN */}
            {activeTab === 'ringkasan' && (
              <div className="flex flex-col gap-6">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                    <Clock className="text-zinc-500 mb-2" size={24} />
                    <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Total Waktu</span>
                    <span className={`text-lg font-black ${theme.text}`}>{mockStats.watchTime}</span>
                  </div>
                  <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                    <MonitorPlay className="text-zinc-500 mb-2" size={24} />
                    <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Episode</span>
                    <span className={`text-lg font-black ${theme.text}`}>{mockStats.episodesWatched.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                    <Star className="text-zinc-500 mb-2" size={24} />
                    <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Genre Pilihan</span>
                    <span className={`text-sm font-bold ${theme.text}`}>{mockStats.favoriteGenres[0]}</span>
                  </div>
                </div>

                {/* Level Widget */}
                <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-64 h-64 ${theme.bg}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
                    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="52" className="stroke-zinc-800" strokeWidth="8" fill="none" />
                        <circle cx="56" cy="56" r="52" className={`stroke-current ${theme.text} transition-all duration-1000 ease-out`} strokeWidth="8" fill="none" strokeDasharray="326.7" strokeDashoffset={326.7 - (326.7 * expPercentage) / 100} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-2 bg-zinc-950 rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Level</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 leading-none">{level}</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left pt-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <Crown className={theme.text} size={20} />
                        <h3 className="text-2xl font-black text-white">{currentRank}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 font-medium mb-4">
                        Pemain telah mengumpulkan <span className={`${theme.text} font-bold`}>{totalExp.toLocaleString()} XP</span>.
                      </p>
                      
                      <div className="bg-zinc-950 rounded-xl p-4 flex justify-between items-center border border-zinc-800/80">
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Bergabung Sejak</p>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            {new Date(profile.created_at || Date.now()).getFullYear()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Progress ke {level+1}</p>
                          <p className="text-sm font-black text-white">{expPercentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Medal className={theme.text} size={18} /> Pencapaian (Badges)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {mockBadges.map((badge) => (
                      <div key={badge.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 w-full sm:w-[calc(50%-6px)] hover:border-zinc-600 transition-colors cursor-default" title={badge.desc}>
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{badge.name}</p>
                          <p className="text-[10px] text-zinc-500">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SHOWCASE */}
            {activeTab === 'showcase' && (
              <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Pin className={theme.text} size={20} /> Favorit {displayName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mockTop10.map((item, idx) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                      <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-md bg-black/80 backdrop-blur-sm border border-zinc-700 flex items-center justify-center text-xs font-black text-white">
                        #{idx + 1}
                      </div>
                      <div className="aspect-[3/4] relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-3 z-10">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${theme.bg}/20 ${theme.text} border ${theme.border}/30 mb-1 inline-block`}>{item.type}</span>
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">{item.title}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AKTIVITAS */}
            {activeTab === 'aktivitas' && (
              <div className="bg-[#15151A] border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className={theme.text} size={20} /> Aktivitas Publik
                </h3>
                
                <div className="flex flex-col gap-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-16 bg-zinc-950 rounded-xl border border-zinc-800/50">
                      <History size={48} className="text-zinc-800 mx-auto mb-3" />
                      <p className="text-zinc-500 font-medium">Belum ada aktivitas yang tercatat.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="relative pl-6 sm:pl-8 border-l border-zinc-800 ml-4 sm:ml-6 space-y-8">
                        {activities.slice(0, visibleActivities).map((act) => (
                          <div key={act.id} className="relative">
                            <div className="absolute -left-[40px] sm:-left-[48px] w-10 h-10 rounded-full bg-zinc-900 border-4 border-[#0a0a0a] flex items-center justify-center shadow-md">
                              {act.activity_type.includes('LIKE') ? <Heart className="text-rose-500" size={16} /> : 
                               act.activity_type.includes('BALAS') ? <MessageCircle className="text-blue-500" size={16} /> :
                               <Activity className={theme.text} size={16} />}
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800/50 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                              <p className={`text-[10px] font-bold ${theme.text} uppercase tracking-widest mb-1.5`}>{act.activity_type}</p>
                              <h4 className="text-sm font-bold text-white mb-2 leading-snug">{act.target_title}</h4>
                              {act.content && <p className="text-sm text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">{act.content}</p>}
                              <span className="text-[10px] font-bold text-zinc-600 mt-3 block flex items-center gap-1.5">
                                <Clock size={12} /> {new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {visibleActivities < activities.length && (
                        <button 
                          onClick={() => setVisibleActivities(prev => prev + 10)}
                          className={`mt-4 w-full py-3 bg-zinc-950 border border-zinc-800 hover:border-${theme.bg}/50 text-zinc-400 hover:${theme.text} font-bold rounded-xl transition-all flex items-center justify-center gap-2`}
                        >
                          Muat Lebih Banyak <ChevronRight size={16} className="rotate-90" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
