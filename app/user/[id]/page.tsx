// @ts-nocheck
'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Sparkles, Star, Target, Crown, CheckCircle, Clock, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Tier calculation (sama dengan yang di profil)
function getUserTier(level: number) {
  if (level >= 100) return { name: 'Mythic', icon: Crown, color: 'from-rose-500 via-purple-500 to-indigo-500', text: 'text-rose-500', border: 'border-rose-500/50', bg: 'bg-rose-500/10' };
  if (level >= 50)  return { name: 'Legend', icon: Crown, color: 'from-amber-400 via-yellow-500 to-orange-500', text: 'text-amber-500', border: 'border-amber-500/50', bg: 'bg-amber-500/10' };
  if (level >= 30)  return { name: 'Epic', icon: Star, color: 'from-purple-400 via-fuchsia-500 to-pink-500', text: 'text-purple-500', border: 'border-purple-500/50', bg: 'bg-purple-500/10' };
  if (level >= 15)  return { name: 'Elite', icon: Shield, color: 'from-blue-400 via-cyan-500 to-teal-500', text: 'text-blue-500', border: 'border-blue-500/50', bg: 'bg-blue-500/10' };
  return { name: 'Newbie', icon: Sparkles, color: 'from-zinc-400 to-zinc-500', text: 'text-zinc-400', border: 'border-zinc-700', bg: 'bg-zinc-800/50' };
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'aktivitas'>('ringkasan');

  useEffect(() => {
    async function loadUser() {
      if (!userId) return;
      try {
        setLoading(true);
        // 1. Ambil data profil
        const { data: profData, error: profError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        
        if (profError) {
          console.error("User not found", profError);
          setProfile({ error: profError.message, isError: true });
          setLoading(false);
          return;
        }
        
        setProfile(profData);

        // 2. Ambil aktivitas terbaru
        const { data: actData } = await supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
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
      <div className="min-h-screen bg-[#0D0D11] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-bold animate-pulse">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.isError) {
    return (
      <div className="min-h-screen bg-[#0D0D11] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Pengguna Tidak Ditemukan</h2>
        <p className="text-zinc-500 mb-2">Profil yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
        {profile?.isError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl max-w-md w-full mb-6 text-sm overflow-auto">
            <span className="font-bold">Error Detail:</span> {profile.error}
            <br />
            <span className="font-bold">User ID:</span> {userId}
          </div>
        )}
        <Link href="/" className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Kembali ke Beranda</Link>
      </div>
    );
  }

  const level = profile.level || 1;
  const currentExp = profile.exp || 0;
  const nextLevelExp = level * 100;
  const expProgress = Math.min(100, Math.round((currentExp / nextLevelExp) * 100));
  const tier = getUserTier(level);
  
  const role = profile.role || 'User';
  const isVerified = profile.is_verified || false;
  const isSpecial = role === 'Developer' || role === 'Admin' || role === 'Moderator' || isVerified;

  return (
    <div className="min-h-screen bg-[#0D0D11] flex flex-col items-center w-full">
      
      {/* Header / Banner */}
      <div className="w-full h-48 sm:h-64 relative bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-[#15151A]`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${tier.color} opacity-10`}></div>
            <h1 className="text-5xl sm:text-7xl font-black text-zinc-800/30 uppercase tracking-widest whitespace-nowrap z-0">VALORANIME</h1>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        
        {/* Back button */}
        <Link href="/" className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors z-20">
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Profile Info */}
      <div className="w-full max-w-3xl px-4 sm:px-6 relative z-10 -mt-20 sm:-mt-24 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end">
          <div className="relative">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#101014] bg-zinc-800 overflow-hidden relative ${isSpecial ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
              <img src={profile.avatar_url || '/avatar.jpeg'} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className={`absolute bottom-2 right-2 ${tier.bg} border border-[#101014] rounded-full p-2 text-white shadow-lg backdrop-blur-md`}>
              <tier.icon size={20} className={tier.text} />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left pb-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {profile.display_name || 'Pengguna Tanpa Nama'}
                {isSpecial && <CheckCircle size={22} className="text-blue-500 fill-blue-500/20"  />}
              </h1>
              {role !== 'User' && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-1 backdrop-blur-sm shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                  <Shield size={12} /> {role}
                </span>
              )}
            </div>
            
            <p className="text-zinc-400 text-sm max-w-lg mx-auto sm:mx-0 leading-relaxed">
              {profile.bio || "Belum ada bio."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-3xl border-b border-zinc-800/80 sticky top-0 bg-[#0D0D11]/90 backdrop-blur-xl z-30">
        <div className="flex overflow-x-auto no-scrollbar">
          {[
            { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
            { id: 'aktivitas', label: 'Aktivitas', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="w-full max-w-3xl p-4 sm:p-6 pb-12">
        
        {/* TAB: RINGKASAN */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Level Card */}
            <div className={`w-full rounded-2xl p-6 relative overflow-hidden border ${tier.border} ${tier.bg}`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">Status Saat Ini</h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl font-black ${tier.text}`}>Level {level}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tier.border} ${tier.text} bg-black/20`}>{tier.name}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-black/20 backdrop-blur-sm ${tier.border}`}>
                    <tier.icon size={28} className={tier.text} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white flex items-center gap-1.5"><Target size={14} className="text-zinc-400"/> {currentExp} <span className="text-zinc-500 font-medium">XP</span></span>
                    <span className="text-zinc-500">{nextLevelExp} <span className="font-medium">XP</span></span>
                  </div>
                  <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full bg-gradient-to-r ${tier.color} rounded-full relative`} style={{ width: `${expProgress}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium text-center pt-1">
                    {nextLevelExp - currentExp} XP menuju Level {level + 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                  <Activity size={20} className="text-blue-500" />
                </div>
                <span className="text-2xl font-black text-white">{activities.length}</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Aktivitas Terakhir</span>
              </div>
              <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <Star size={20} className="text-purple-500" />
                </div>
                <span className="text-2xl font-black text-white">{new Date(profile.created_at || Date.now()).getFullYear()}</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Bergabung Sejak</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: AKTIVITAS */}
        {activeTab === 'aktivitas' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} /> Aktivitas Publik Terakhir
            </h3>
            
            {activities.length === 0 ? (
              <div className="p-8 text-center bg-[#15151A] border border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 font-medium">Belum ada aktivitas yang tercatat.</p>
              </div>
            ) : (
              <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {activities.map((act, idx) => (
                  <div key={act.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0D0D11] bg-zinc-800 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <MessageSquare size={14} className={act.activity_type.includes('KOMENTAR') ? 'text-blue-400' : 'text-zinc-400'} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-zinc-800 bg-[#15151A] shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-xs bg-zinc-800 px-2 py-1 rounded-md">{act.activity_type}</span>
                        <time className="text-[10px] font-bold text-zinc-500 uppercase">
                          {new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </time>
                      </div>
                      <Link href={act.target_url || '#'} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors block mb-1">
                        {act.target_title}
                      </Link>
                      {act.content && (
                        <p className="text-zinc-400 text-xs italic bg-[#0D0D11] p-3 rounded-xl border border-zinc-800/50">"{act.content}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
