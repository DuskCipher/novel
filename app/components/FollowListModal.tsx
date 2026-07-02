import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowListModal({ isOpen, onClose, userId, type }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (type === 'followers') {
        // Get users who follow this userId (follower_id)
        const { data, error } = await supabase
          .from('user_follows')
          .select('follower_id, follower:profiles!user_follows_follower_id_fkey(id, username, avatar_url, level, role)')
          .eq('following_id', userId)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setUsers(data.map(d => d.follower).filter(Boolean));
        }
      } else {
        // Get users who this userId follows (following_id)
        const { data, error } = await supabase
          .from('user_follows')
          .select('following_id, following:profiles!user_follows_following_id_fkey(id, username, avatar_url, level, role)')
          .eq('follower_id', userId)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setUsers(data.map(d => d.following).filter(Boolean));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1B1D2A] w-full max-w-sm rounded-xl border border-zinc-800 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {type === 'followers' ? 'Pengikut' : 'Mengikuti'}
          </h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-zinc-500 text-sm">
              Belum ada pengguna.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {users.map((u, i) => (
                <Link 
                  href={`/user/${u.id}`} 
                  key={i}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.username} className="w-10 h-10 rounded-full object-cover shrink-0 bg-zinc-800" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                      <UserIcon size={20} className="text-zinc-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{u.username || 'Pengguna'}</div>
                    <div className="text-[10px] text-zinc-400">Lv.{u.level || 1} • {u.role || 'User'}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
