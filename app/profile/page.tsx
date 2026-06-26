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
  Coffee, MessageCircle, Crown, Search, Bookmark, History, Activity, Camera, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// =====================
// Toggle Switch 
// =====================
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut, updateUserMeta } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'aktivitas' | 'riwayat' | 'bookmark' | 'pengaturan'>('ringkasan');
  const [historyTab, setHistoryTab] = useState<'Anime' | 'Komik' | 'Novel' | 'Sankanime ID' | 'Donghua'>('Donghua');
  const [bookmarkTab, setBookmarkTab] = useState<'Anime' | 'Comic' | 'Novel' | 'Sankanime ID' | 'Donghua'>('Donghua');
  const [isDark, setIsDark] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  // Data States
  const [activities, setActivities] = useState<any[]>([]);
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

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    
    // Fetch Activities
    const { data: actData } = await supabase.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
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

  if (authLoading) {
    return <div className="flex-1 flex items-center justify-center pt-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-20">
        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
          <User size={40} className="text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Login</h2>
        <p className="text-zinc-400 mb-8 max-w-sm">Silakan login untuk mengakses profil, riwayat, dan bookmark Anda.</p>
        <Link href="/login" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all">
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
  const totalExp = ((level - 1) * 100) + currentExp; // Approximation for display
  const bio = user.user_metadata?.bio || 'Belum ada bio.';
  
  const rankNames = ['Newbie', 'Novice', 'Apprentice', 'Adept', 'Expert', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic'];
  const currentRank = rankNames[Math.min(Math.floor(level / 10), rankNames.length - 1)];
  const nextRank = rankNames[Math.min(Math.floor(level / 10) + 1, rankNames.length - 1)];

  return (
    <div className="flex-1 min-w-0 pb-20 flex flex-col items-center relative">
      
      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="w-full bg-red-600 text-white px-4 py-3 flex justify-between items-center z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="font-bold text-sm">Mode Preview Profil Publik</span>
          </div>
          <button onClick={() => setPreviewMode(false)} className="bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Kembali ke Edit
          </button>
        </div>
      )}

      {/* Banner & Header Section */}
      <div className="w-full max-w-3xl relative">
        {/* Banner */}
        <div className="w-full h-32 sm:h-48 bg-[#15151A] relative overflow-hidden flex items-center justify-center">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <h1 className="text-5xl sm:text-7xl font-black text-zinc-800/30 uppercase tracking-widest whitespace-nowrap z-0">VALORANIME</h1>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-transparent z-10"></div>
          
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
          
          {!previewMode && (
            <button 
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-white/10 disabled:opacity-50"
            >
              {isUploadingBanner ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
              {isUploadingBanner ? 'Mengupload...' : 'Ganti Banner'}
            </button>
          )}
        </div>

        {/* Profile Card Overlay */}
        <div className="w-full px-4 flex flex-col items-center -mt-16 sm:-mt-20 relative z-20">
          
          <div className="relative group cursor-pointer" onClick={() => !previewMode && openEditModal()}>
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#101014] bg-zinc-800 overflow-hidden relative ${isSpecial ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              {!previewMode && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={28} />
                </div>
              )}
            </div>
            {!previewMode && (
              <div className="absolute bottom-1 right-1 w-8 h-8 bg-red-600 rounded-full border-2 border-[#101014] flex items-center justify-center text-white">
                <Camera size={14} />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h2>
            {isSpecial && <CheckCircle size={22} className="text-blue-500 fill-blue-500/20"  />}
          </div>

          {!previewMode && (
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setActiveTab('ringkasan'); setPreviewMode(true); }} className="px-5 py-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-colors border border-zinc-700">
                <User size={16} className="inline mr-2 -mt-0.5" /> Preview Profile
              </button>
              <button onClick={openEditModal} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">
                <Settings size={16} className="inline mr-2 -mt-0.5" /> Edit Profil
              </button>
            </div>
          )}
          {previewMode && (
            <div className="mt-4 flex gap-2">
               <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-full border border-zinc-700">Level {level}</span>
               <span className="px-3 py-1 bg-red-600/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">{currentRank}</span>
            </div>
          )}

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full max-w-3xl mt-8 border-b border-zinc-800 px-2 sm:px-0">
        <div className="flex overflow-x-auto no-scrollbar">
          {[
            { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
            { id: 'aktivitas', label: 'Aktivitas', icon: History },
            { id: 'riwayat', label: 'Riwayat', icon: History, hideInPreview: true },
            { id: 'bookmark', label: 'Bookmark', icon: Bookmark, hideInPreview: true },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings, hideInPreview: true },
          ].filter(tab => !(previewMode && tab.hideInPreview)).map((tab) => (
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
          <div className="flex flex-col gap-5">
            {/* Level Card */}
            <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="text-red-600" size={20} />
                <h3 className="text-lg font-bold text-white">Level Saya</h3>
              </div>
              
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 p-[3px] shrink-0">
                  <div className="w-full h-full bg-[#15151A] rounded-full flex items-center justify-center">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-red-600 to-rose-500">{level}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-1">{currentRank}</h4>
                  <p className="text-xs text-zinc-500 mb-4">Next Rank: <span className="font-bold text-zinc-300">{nextRank}</span></p>
                  
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${expPercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-500 font-medium">
                    <span>{currentExp} XP to level {level + 1}</span>
                    <span>{expPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-zinc-800/60 flex justify-between items-center uppercase tracking-wider text-xs font-bold">
                <span className="text-zinc-500">Total Experience</span>
                <span className="text-red-600">{totalExp} XP</span>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="text-zinc-500" size={18} />
                <h3 className="text-base font-bold text-white">Bio</h3>
              </div>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{bio}</p>
            </div>

            {/* Quick Links */}
            {!previewMode && (
              <div className="flex flex-col gap-3">
                <button onClick={() => setActiveTab('riwayat')} className="bg-[#15151A] hover:bg-[#1a1a20] transition-colors border border-zinc-800 rounded-lg p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <History className="text-zinc-500 group-hover:text-red-600 transition-colors" size={20} />
                    Terakhir Ditonton
                  </div>
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Lihat Semua</span>
                </button>

                <button onClick={() => setActiveTab('bookmark')} className="bg-[#15151A] hover:bg-[#1a1a20] transition-colors border border-zinc-800 rounded-lg p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-sm font-bold text-white">
                    <Bookmark className="text-zinc-500 group-hover:text-red-600 transition-colors" size={20} />
                    Bookmark
                  </div>
                  <ChevronRight className="text-zinc-600" size={16} />
                </button>

                <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 font-medium mb-1">Status Akun</span>
                    <span className="text-sm font-bold text-emerald-500">Terverifikasi</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="text-emerald-500" size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: AKTIVITAS */}
        {activeTab === 'aktivitas' && (
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <History className="text-red-600" size={20} />
                <h3 className="text-lg font-bold text-white">Aktivitas Terakhir</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                {loadingData ? (
                  <div className="text-center py-10 text-zinc-500 font-medium text-sm animate-pulse">Memuat...</div>
                ) : activities.length === 0 ? (
                  <div className="bg-[#15151A] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">Belum ada aktivitas.</div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="bg-[#15151A] border border-zinc-800 rounded-xl p-4 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1A1A22] flex items-center justify-center shrink-0">
                        {act.activity_type.includes('LIKE') ? <Heart className="text-red-500" size={18} /> : 
                         act.activity_type.includes('BALAS') ? <MessageCircle className="text-blue-500" size={18} /> :
                         <MessageCircle className="text-red-600" size={18} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">{act.activity_type}</p>
                        <h4 className="text-sm font-bold text-white mb-1 leading-tight">{act.target_title}</h4>
                        {act.content && <p className="text-xs text-zinc-400">{act.content}</p>}
                        <span className="text-[10px] text-zinc-600 mt-2 block">{new Date(act.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#15151A] border border-zinc-800 rounded-2xl p-5 sm:p-6 mt-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="text-red-600" size={20} />
                  <h3 className="text-lg font-bold text-white">XP Breakdown</h3>
                </div>
                <select className="bg-[#1A1A22] border border-zinc-800 text-white text-xs font-bold rounded-lg px-3 py-1.5 outline-none">
                  <option>Semua</option>
                  <option>Bulan Ini</option>
                </select>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-[#1A1A22] rounded-xl p-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center"><MessageCircle size={16} className="text-red-600"/></div>
                    <div>
                      <p className="text-sm font-bold text-white">Comments & Replies</p>
                      <p className="text-[10px] text-zinc-500">2 × 25 XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600">50 XP</span>
                </div>

                <div className="flex justify-between items-center bg-[#1A1A22] rounded-xl p-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"><PlayCircle size={16} className="text-emerald-500"/></div>
                    <div>
                      <p className="text-sm font-bold text-white">Episodes Watched</p>
                      <p className="text-[10px] text-zinc-500">1 × 10 XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-500">10 XP</span>
                </div>

                <div className="flex justify-between items-center bg-[#1A1A22] rounded-xl p-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"><Heart size={16} className="text-red-500"/></div>
                    <div>
                      <p className="text-sm font-bold text-white">Likes Given</p>
                      <p className="text-[10px] text-zinc-500">1 × 5 XP</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-500">5 XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RIWAYAT & BOOKMARK */}
        {(activeTab === 'riwayat' || activeTab === 'bookmark') && !previewMode && (
          <div className="flex flex-col gap-5">
            
            {/* Sub Tabs */}
            <div className="flex flex-wrap gap-2">
              {['Anime', 'Komik', 'Novel', 'Sankanime ID', 'Donghua'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => activeTab === 'riwayat' ? setHistoryTab(cat as any) : setBookmarkTab(cat as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    (activeTab === 'riwayat' ? historyTab : bookmarkTab) === cat 
                      ? 'bg-red-600/20 text-red-500 border border-red-500/30' 
                      : 'bg-[#15151A] text-zinc-400 border border-zinc-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              {activeTab === 'riwayat' ? <History className="text-red-600" size={20} /> : <Bookmark className="text-red-600" size={20} />}
              <h3 className="text-lg font-bold text-white">{activeTab === 'riwayat' ? 'Riwayat' : 'Bookmark'} {activeTab === 'riwayat' ? historyTab : bookmarkTab}</h3>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-[#15151A] border border-zinc-800 rounded-xl flex items-center px-4">
                <Search size={16} className="text-zinc-500" />
                <input type="text" placeholder={`Cari ${activeTab}...`} className="w-full bg-transparent border-none text-sm text-white px-3 py-3 outline-none placeholder:text-zinc-600" />
              </div>
              {activeTab === 'riwayat' ? (
                <button className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 px-4 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                  <Trash2 size={14} /> Hapus Semua
                </button>
              ) : (
                <button className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 px-4 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                  Import
                </button>
              )}
            </div>

            {/* List Content */}
            <div className="mt-4">
              {loadingData ? (
                <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Memuat data...</div>
              ) : (activeTab === 'riwayat' ? history : bookmarks).filter(item => (item.category || 'Donghua').toLowerCase() === (activeTab === 'riwayat' ? historyTab : bookmarkTab).toLowerCase()).length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">Belum ada {activeTab} di {activeTab === 'riwayat' ? historyTab : bookmarkTab}.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(activeTab === 'riwayat' ? history : bookmarks).filter(item => (item.category || 'Donghua').toLowerCase() === (activeTab === 'riwayat' ? historyTab : bookmarkTab).toLowerCase()).map((item, idx) => (
                    <Link href={item.item_url || item.href || '#'} key={idx} className="relative group block rounded-xl overflow-hidden bg-[#15151A] border border-zinc-800">
                      <div className="aspect-[3/4] relative">
                        {(item.poster || item.image || item.image_url || item.thumbnail) ? (
                          <>
                            <img 
                              src={item.poster || item.image || item.image_url || item.thumbnail} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                                }
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center text-zinc-600 bg-[#1A1A22] text-xs font-bold uppercase tracking-wider absolute inset-0">Not Found</div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-[#1A1A22] text-xs font-bold uppercase tracking-wider">Not Found</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#101014]/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 w-full">
                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">{item.title}</h4>
                          {activeTab === 'riwayat' && item.last_episode && (
                            <p className="text-[10px] text-zinc-400 mt-1 font-bold">Episode {item.last_episode}</p>
                          )}
                        </div>
                        <button className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 text-white">
                          <X size={12} />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PENGATURAN */}
        {activeTab === 'pengaturan' && !previewMode && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#15151A] border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Aplikasi</h3>
              </div>
              <div className="p-5 flex justify-between items-center border-b border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Mode Gelap</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Tema gelap yang nyaman di mata</p>
                </div>
                <ToggleSwitch checked={isDark} onChange={() => { const newTheme = !isDark; setIsDark(newTheme); if(newTheme){document.documentElement.classList.add("dark"); localStorage.setItem("theme","dark")}else{document.documentElement.classList.remove("dark"); localStorage.setItem("theme","light")} }} />
              </div>
            </div>

            <div className="bg-[#15151A] border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Keamanan</h3>
              </div>
              <button onClick={async () => { const newPass = prompt("Masukkan password baru:"); if(newPass && newPass.length >= 6){ const {error} = await supabase.auth.updateUser({password: newPass}); if(error) alert(error.message); else alert("Password berhasil diubah!"); } else if(newPass) alert("Password harus minimal 6 karakter") }} className="w-full p-5 flex justify-between items-center border-b border-zinc-800 hover:bg-[#1a1a20] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><Key size={16} className="text-zinc-400"/></div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white">Ubah Password</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Perbarui kata sandi Anda</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-zinc-600" />
              </button>
            </div>

            <button onClick={handleLogout} className="mt-4 w-full p-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <LogOut size={18} /> Keluar dari Akun
            </button>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && !previewMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#15151A] border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-[#1A1A22]">
              <h3 className="text-lg font-bold text-white">Edit Profil</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800 relative group">
                  <img src={avatarPreview || '/avatar.jpeg'} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-red-600 hover:text-red-500">Ganti Foto Profil</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Nama Tampilan</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0D0D11] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50"
                  placeholder="Nama keren kamu..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase">Bio</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#0D0D11] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50 resize-none h-24"
                  placeholder="Ceritakan tentang dirimu..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
