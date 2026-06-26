// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { 
  User, Settings, Info, Bell, LogOut, ChevronRight, X, Edit3, 
  Image as ImageIcon, Loader2, Moon, Sun, Lock, Key, Shield, 
  Smartphone, Globe, Trash2, BookOpen, Heart, CheckCircle, 
  AlertCircle, Zap, Code2, ExternalLink, Github, PlayCircle, Book, FileText, Rocket,
  Coffee, MessageCircle, Crown, Search, Bookmark, History, Activity, Camera, ArrowLeft,
  Sparkles, TrendingUp, Eye, Clock, Star, Users, Medal, Trophy, Palette, Pin, MonitorPlay
} from 'lucide-react';
import Link from 'next/link';

// =====================
// Toggle Switch 
// =====================
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-amber-500' : 'bg-zinc-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut, updateUserMeta } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'showcase' | 'aktivitas' | 'riwayat' | 'bookmark' | 'pengaturan'>('ringkasan');
  const [historyTab, setHistoryTab] = useState<'Anime' | 'Komik' | 'Novel' | 'Donghua'>('Donghua');
  const [bookmarkTab, setBookmarkTab] = useState<'Anime' | 'Comic' | 'Novel' | 'Donghua'>('Donghua');
  const [watchlistFilter, setWatchlistFilter] = useState<'Semua' | 'Watching' | 'Completed' | 'On Hold' | 'Plan to Watch'>('Semua');
  const [isDark, setIsDark] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [themeColor, setThemeColor] = useState('amber'); // amber, blue, rose, emerald, purple

  // Data States
  const [activities, setActivities] = useState<any[]>([]);
  const [visibleActivities, setVisibleActivities] = useState(10);
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Profile Edit
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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
    setIsDark(document.documentElement.classList.contains('dark'));
    const savedTheme = localStorage.getItem('profileTheme') || 'amber';
    setThemeColor(savedTheme);
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    
    // Fetch Activities
    const { data: actData } = await supabase.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (actData) setActivities(actData);

    // Fetch History & Bookmarks
    const { data: histData } = await supabase.from('user_history').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (histData) {
      setHistory(histData);
    }

    const { data: bkmData } = await supabase.from('user_bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (bkmData) {
      setBookmarks(bkmData);
    }
    
    setLoadingData(false);
  };

  const handleLogout = async () => { await signOut(); window.location.href = '/login'; };

  const openEditModal = () => {
    setEditName(user?.user_metadata?.display_name || user?.email?.split('@')[0] || '');
    setEditBio(user?.user_metadata?.bio || '');
    setAvatarPreview(user?.user_metadata?.avatar_url || '');
    setAvatarFile(null);
    setShowEditModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setIsUploadingBanner(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          await updateUserMeta({ banner_url: url });
          await supabase.from('profiles').update({ banner_url: url }).eq('id', user?.id);
        }
      } catch (err) {
        alert('Gagal mengupload banner');
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      let finalAvatarUrl = user?.user_metadata?.avatar_url || '';
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          finalAvatarUrl = url;
        }
      }
      await updateUserMeta({ display_name: editName, avatar_url: finalAvatarUrl, bio: editBio });
      
      // Update DB Profiles
      await supabase.from('profiles').update({ bio: editBio }).eq('id', user?.id);
      
      setShowEditModal(false);
    } catch (e) {
      alert('Terjadi kesalahan saat mengupdate profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem('profileTheme', color);
  };

  // Helper for dynamic colors
  const getThemeColors = () => {
    switch (themeColor) {
      case 'blue': return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', from: 'from-blue-600', to: 'to-cyan-500' };
      case 'rose': return { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500', ring: 'ring-rose-500', from: 'from-rose-600', to: 'to-pink-500' };
      case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500', from: 'from-emerald-600', to: 'to-teal-500' };
      case 'purple': return { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', ring: 'ring-purple-500', from: 'from-purple-600', to: 'to-indigo-500' };
      default: return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', ring: 'ring-amber-500', from: 'from-amber-600', to: 'to-orange-500' };
    }
  };
  const theme = getThemeColors();

  if (authLoading) {
    return <div className="flex-1 flex items-center justify-center py-40"><Loader2 className={`animate-spin ${theme.text}`} size={40} /></div>;
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center py-40">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-zinc-800">
          <User size={40} className="text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Login</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">Silakan login untuk mengakses profil, riwayat, dan bookmark Anda.</p>
        <Link href="/login" className={`px-8 py-3 ${theme.bg} hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg`}>
          Login Sekarang
        </Link>
      </div>
    );
  }

  // User Stats
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Pengguna';
  const avatarUrl = user.user_metadata?.avatar_url || '/avatar.jpeg';
  const bannerUrl = user.user_metadata?.banner_url || '';
  const isVerified = user.user_metadata?.is_verified || false;
  const role = user.user_metadata?.role || 'User';
  const isSpecial = role === 'Developer' || role === 'Admin' || role === 'Moderator' || isVerified;
  const level = user.user_metadata?.level || 1;
  const currentExp = user.user_metadata?.exp || 0;
  const expNeeded = level * 100;
  const expPercentage = Math.min(100, Math.round((currentExp / expNeeded) * 100));
  const totalExp = ((level - 1) * 100) + currentExp; 
  const bio = user.user_metadata?.bio || 'Belum ada bio.';
  
  const rankNames = ['Rookie', 'Veteran', 'Elite', 'Legend', 'Mythic'];
  const currentRank = rankNames[Math.min(Math.floor(level / 20), rankNames.length - 1)];
  const nextRank = rankNames[Math.min(Math.floor(level / 20) + 1, rankNames.length - 1)];

  return (
    <>
      <div className="flex-1 min-w-0 pb-20 font-sans">
        
        {/* Preview Mode Banner */}
        {previewMode && (
          <div className={`w-full bg-gradient-to-r ${theme.from} ${theme.to} text-white px-6 py-3 flex justify-between items-center z-50 sticky top-0 shadow-lg`}>
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span className="font-bold text-sm">Mode Preview Profil Publik</span>
            </div>
            <button onClick={() => setPreviewMode(false)} className="bg-black/20 hover:bg-black/40 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> Kembali Edit
            </button>
          </div>
        )}

        <div className="w-full">
          {/* Banner Section */}
          <div className="w-full h-48 sm:h-64 lg:h-80 bg-zinc-900 relative flex items-center justify-center group overflow-hidden">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10"></div>
            
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
            
            {!previewMode && (
              <button 
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="absolute top-6 right-6 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-colors border border-white/10 disabled:opacity-50 shadow-xl"
              >
                {isUploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                {isUploadingBanner ? 'Mengupload...' : 'Ganti Banner'}
              </button>
            )}
          </div>

          {/* Profile Header (Overlaps Banner) */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 relative z-20 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            
            {/* Avatar */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => !previewMode && openEditModal()}>
              <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#0a0a0a] bg-zinc-900 overflow-hidden relative shadow-2xl ring-2 ${theme.ring} ring-offset-4 ring-offset-[#0a0a0a]`}>
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {!previewMode && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={28} />
                  </div>
                )}
              </div>
              {!previewMode && (
                <div className={`absolute bottom-2 right-2 w-10 h-10 ${theme.bg} rounded-full border-4 border-[#0a0a0a] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <Camera size={16} />
                </div>
              )}
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
                <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-zinc-400">
                  <span className="font-bold text-white">{mockSocial.followers}</span> Followers
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-zinc-400">
                  <span className="font-bold text-white">{mockSocial.following}</span> Following
                </div>
                {previewMode && (
                  <button className={`ml-4 px-4 py-1.5 ${theme.bg} hover:opacity-80 text-white text-xs font-bold rounded-full transition-colors`}>
                    Ikuti (Follow)
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            {!previewMode && (
              <div className="flex gap-3 sm:mb-6 w-full sm:w-auto mt-4 sm:mt-0">
                <button onClick={() => { setActiveTab('ringkasan'); setPreviewMode(true); }} className="flex-1 sm:flex-none px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-colors border border-zinc-800 shadow-lg flex items-center justify-center gap-2">
                  <User size={16} /> Preview
                </button>
                <button onClick={openEditModal} className={`flex-1 sm:flex-none px-6 py-2.5 ${theme.bg} hover:opacity-90 text-white text-sm font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2`}>
                  <Edit3 size={16} /> Edit Profil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT SIDEBAR (TABS) */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-2 sticky top-24 shadow-xl">
                {[
                  { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
                  { id: 'showcase', label: 'Top Favorit', icon: Star },
                  { id: 'aktivitas', label: 'Aktivitas', icon: History },
                  { id: 'riwayat', label: 'Riwayat Tontonan', icon: MonitorPlay, hideInPreview: true },
                  { id: 'bookmark', label: 'Watchlist Saya', icon: Bookmark, hideInPreview: true },
                  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, hideInPreview: true },
                ].filter(tab => !(previewMode && tab.hideInPreview)).map((tab) => (
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
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                      <Clock className="text-zinc-500 mb-2" size={24} />
                      <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Total Waktu</span>
                      <span className={`text-lg font-black ${theme.text}`}>{mockStats.watchTime}</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                      <MonitorPlay className="text-zinc-500 mb-2" size={24} />
                      <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Episode</span>
                      <span className={`text-lg font-black ${theme.text}`}>{mockStats.episodesWatched.toLocaleString()}</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-xl">
                      <Star className="text-zinc-500 mb-2" size={24} />
                      <span className="text-xs text-zinc-400 font-bold uppercase mb-1">Genre Pilihan</span>
                      <span className={`text-sm font-bold ${theme.text}`}>{mockStats.favoriteGenres[0]}</span>
                    </div>
                  </div>

                  {/* Level & Rank Widget */}
                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-64 h-64 ${theme.bg}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
                      {/* Level Ring */}
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

                      {/* Rank Info */}
                      <div className="flex-1 w-full text-center sm:text-left pt-2">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                          <Crown className={theme.text} size={20} />
                          <h3 className="text-2xl font-black text-white">{currentRank}</h3>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium mb-4">
                          Kumpulkan <span className={`${theme.text} font-bold`}>{expNeeded - currentExp} XP</span> lagi untuk mencapai rank {nextRank}.
                        </p>
                        
                        <div className="bg-zinc-950 rounded-xl p-4 flex justify-between items-center border border-zinc-800/80">
                          <div>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Experience</p>
                            <p className="text-lg font-black text-white flex items-center gap-1.5">
                              <Sparkles size={16} className={theme.text} />
                              {totalExp.toLocaleString()} <span className={`text-xs ${theme.text}/80`}>XP</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Progress</p>
                            <p className="text-lg font-black text-white">{expPercentage}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Achievements */}
                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 shadow-xl">
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

                  {/* Mini Leaderboard */}
                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Trophy className={theme.text} size={18} /> Posisi Peringkat
                      </h3>
                      <Link href="/leaderboard" className={`text-xs font-bold ${theme.text} hover:underline`}>Lihat Papan Peringkat</Link>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${theme.bg}/20 flex items-center justify-center text-lg font-black ${theme.text}`}>#42</div>
                        <div>
                          <p className="text-sm font-bold text-white">Kamu berada di Top 5%</p>
                          <p className="text-xs text-zinc-500">Kalahkan 5 Player lagi untuk naik divisi.</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-zinc-600" />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: SHOWCASE (TOP 10) */}
              {activeTab === 'showcase' && (
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Pin className={theme.text} size={20} /> Top 10 Favorit Saya
                    </h3>
                    {!previewMode && (
                      <button className={`px-4 py-2 ${theme.bg}/10 ${theme.text} hover:${theme.bg} hover:text-white transition-colors text-xs font-bold rounded-lg border ${theme.border}/20`}>
                        Edit Showcase
                      </button>
                    )}
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
                    {/* Add New Placeholder */}
                    {!previewMode && mockTop10.length < 10 && (
                      <div className="relative rounded-xl overflow-hidden bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-zinc-600 transition-colors flex flex-col items-center justify-center aspect-[3/4] cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center mb-2 transition-colors">
                          <span className="text-2xl font-light text-zinc-500 group-hover:text-white">+</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Tambah Favorit</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: AKTIVITAS */}
              {activeTab === 'aktivitas' && (
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className={theme.text} size={20} /> Aktivitas Terakhir
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {loadingData ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 size={32} className={`${theme.text} animate-spin`} />
                        <p className="text-zinc-500 font-medium text-sm">Memuat aktivitas...</p>
                      </div>
                    ) : activities.length === 0 ? (
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

              {/* TAB: RIWAYAT & BOOKMARK */}
              {(activeTab === 'riwayat' || activeTab === 'bookmark') && !previewMode && (
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {activeTab === 'riwayat' ? <MonitorPlay className={theme.text} size={20} /> : <Bookmark className={theme.text} size={20} />}
                      {activeTab === 'riwayat' ? 'Riwayat Tontonan' : 'Daftar Bookmark (Watchlist)'}
                    </h3>
                    
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input 
                        type="text" 
                        placeholder={`Cari di ${activeTab}...`} 
                        className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-${theme.bg}/50`}
                      />
                    </div>
                  </div>

                  {/* Sub Category Pills */}
                  <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-4 pb-2">
                    {['Donghua', 'Anime', 'Komik', 'Novel'].map(cat => {
                      const isActive = (activeTab === 'riwayat' ? historyTab : bookmarkTab) === cat;
                      return (
                        <button 
                          key={cat}
                          onClick={() => activeTab === 'riwayat' ? setHistoryTab(cat as any) : setBookmarkTab(cat as any)}
                          className={`shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isActive 
                              ? `${theme.bg} text-white ${theme.border} shadow-lg shadow-${theme.bg}/20` 
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bookmark Filters (Watchlist Status) */}
                  {activeTab === 'bookmark' && (
                    <div className="flex flex-wrap gap-2 mb-6 bg-zinc-950 p-2 rounded-xl border border-zinc-800/50">
                      {['Semua', 'Watching', 'Completed', 'On Hold', 'Plan to Watch'].map(filter => (
                        <button 
                          key={filter}
                          onClick={() => setWatchlistFilter(filter as any)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            watchlistFilter === filter ? `bg-zinc-800 text-white` : `text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900`
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Grid Content */}
                  {loadingData ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 size={32} className={`${theme.text} animate-spin`} />
                    </div>
                  ) : (activeTab === 'riwayat' ? history : bookmarks).filter(item => (item.category || 'Donghua').toLowerCase() === (activeTab === 'riwayat' ? historyTab : bookmarkTab).toLowerCase()).length === 0 ? (
                    <div className="text-center py-16 bg-zinc-950 rounded-xl border border-zinc-800/50">
                      {activeTab === 'riwayat' ? <History size={48} className="text-zinc-800 mx-auto mb-3" /> : <Bookmark size={48} className="text-zinc-800 mx-auto mb-3" />}
                      <p className="text-zinc-500 font-medium">Belum ada {activeTab} untuk kategori {activeTab === 'riwayat' ? historyTab : bookmarkTab}.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {(activeTab === 'riwayat' ? history : bookmarks).filter(item => (item.category || 'Donghua').toLowerCase() === (activeTab === 'riwayat' ? historyTab : bookmarkTab).toLowerCase()).map((item, idx) => (
                        <Link href={item.item_url || item.href || '#'} key={idx} className="group relative block rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-md">
                          <div className="aspect-[3/4] relative overflow-hidden">
                            {(item.poster || item.image || item.image_url || item.thumbnail) ? (
                              <img 
                                src={item.poster || item.image || item.image_url || item.thumbnail} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/avatar.jpeg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90"></div>
                            
                            <div className="absolute bottom-0 left-0 p-3 w-full z-10">
                              {activeTab === 'bookmark' && (
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 mb-1 inline-block`}>Watching</span>
                              )}
                              <h4 className={`text-[11px] sm:text-xs font-bold text-white line-clamp-2 leading-tight group-hover:${theme.text} transition-colors`}>{item.title}</h4>
                              {activeTab === 'riwayat' && item.last_episode && (
                                <p className="text-[10px] text-zinc-400 mt-1.5 font-bold flex items-center gap-1">
                                  <PlayCircle size={10} className={theme.text} /> Ep {item.last_episode}
                                </p>
                              )}
                            </div>
                            
                            <button className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:scale-110 text-white z-20 backdrop-blur-sm">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PENGATURAN */}
              {activeTab === 'pengaturan' && !previewMode && (
                <div className="flex flex-col gap-6">
                  
                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/50">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Palette className={theme.text} size={18} /> Tema Profil (VIP)
                      </h3>
                    </div>
                    <div className="p-5 sm:p-6 bg-zinc-950/30">
                      <p className="text-sm text-zinc-400 mb-4">Kustomisasi warna aksen untuk profil kamu.</p>
                      <div className="flex gap-4">
                        {[
                          { id: 'amber', color: 'bg-amber-500' },
                          { id: 'blue', color: 'bg-blue-500' },
                          { id: 'rose', color: 'bg-rose-500' },
                          { id: 'emerald', color: 'bg-emerald-500' },
                          { id: 'purple', color: 'bg-purple-500' },
                        ].map(t => (
                          <button 
                            key={t.id}
                            onClick={() => handleThemeChange(t.id)}
                            className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center transition-transform hover:scale-110 ${themeColor === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : 'opacity-50'}`}
                          >
                            {themeColor === t.id && <CheckCircle size={16} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/50">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Settings className={theme.text} size={18} /> Preferensi Aplikasi
                      </h3>
                    </div>
                    <div className="p-5 sm:p-6 flex justify-between items-center bg-zinc-950/30">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">Mode Gelap</h4>
                        <p className="text-xs text-zinc-500">Gunakan tema gelap untuk kenyamanan mata.</p>
                      </div>
                      <ToggleSwitch checked={isDark} onChange={() => { const newTheme = !isDark; setIsDark(newTheme); if(newTheme){document.documentElement.classList.add("dark"); localStorage.setItem("theme","dark")}else{document.documentElement.classList.remove("dark"); localStorage.setItem("theme","light")} }} />
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/50">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Shield className={theme.text} size={18} /> Keamanan Akun
                      </h3>
                    </div>
                    <button onClick={async () => { const newPass = prompt("Masukkan password baru:"); if(newPass && newPass.length >= 6){ const {error} = await supabase.auth.updateUser({password: newPass}); if(error) alert(error.message); else alert("Password berhasil diubah!"); } else if(newPass) alert("Password harus minimal 6 karakter") }} className="w-full p-5 sm:p-6 flex justify-between items-center bg-zinc-950/30 hover:bg-zinc-800/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors"><Key size={18} className="text-zinc-400 group-hover:text-white"/></div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-white mb-1">Ubah Kata Sandi</h4>
                          <p className="text-xs text-zinc-500">Perbarui kata sandi Anda secara berkala.</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className={`text-zinc-600 group-hover:${theme.text} transition-colors`} />
                    </button>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl shadow-xl overflow-hidden mt-4">
                    <button onClick={handleLogout} className="w-full p-5 sm:p-6 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors group">
                      <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                      <span className="font-bold text-sm">Keluar dari Akun</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && !previewMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-5 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-950">
                <h3 className="text-lg font-bold text-white">Edit Profil</h3>
                <button onClick={() => setShowEditModal(false)} className="text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-950 relative group shadow-lg">
                    <img src={avatarPreview || '/avatar.jpeg'} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={`text-xs font-bold ${theme.text} hover:opacity-80 ${theme.bg}/10 px-4 py-1.5 rounded-full transition-colors`}>
                    Ubah Foto
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Nama Tampilan</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-${theme.bg} focus:ring-1 focus:ring-${theme.bg} transition-all`}
                    placeholder="Nama keren kamu..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Bio Singkat</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-${theme.bg} focus:ring-1 focus:ring-${theme.bg} transition-all resize-none h-28`}
                    placeholder="Ceritakan tentang dirimu..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className={`w-full py-4 mt-2 ${theme.bg} hover:opacity-90 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg`}
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
