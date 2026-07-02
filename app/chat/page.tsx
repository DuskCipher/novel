'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Search, MessageSquare, Plus } from 'lucide-react';
import PrivateChatList from '../components/PrivateChatList';
import PrivateChatRoom from '../components/PrivateChatRoom';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0a0a0a]"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;
  }

  if (!user) {
    router.replace('/');
    return null;
  }

  const showList = !isMobile || (isMobile && !selectedChat);
  const showRoom = !isMobile || (isMobile && selectedChat);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden pt-16 sm:pt-20">
      
      {/* Left Panel: Chat List */}
      {showList && (
        <div className={`flex flex-col border-r border-zinc-800 ${isMobile ? 'w-full' : 'w-[350px] lg:w-[400px]'}`}>
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-amber-500">Pesan Pribadi</h1>
            <button 
              onClick={() => router.push('/')}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors sm:hidden"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          
          <PrivateChatList 
            user={user} 
            selectedChatId={selectedChat?.id} 
            onSelectChat={(chat) => setSelectedChat(chat)} 
          />
        </div>
      )}

      {/* Right Panel: Chat Room */}
      {showRoom && (
        <div className="flex-1 flex flex-col bg-[#121212]">
          {selectedChat ? (
            <PrivateChatRoom 
              user={user} 
              chat={selectedChat} 
              onBack={() => setSelectedChat(null)} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <MessageSquare size={64} className="mb-4 opacity-50" />
              <h2 className="text-xl font-medium text-zinc-300">Valora Chat</h2>
              <p className="mt-2 text-sm text-center max-w-sm">
                Pilih obrolan dari daftar di sebelah kiri atau mulai percakapan baru untuk mengirim rekomendasi anime!
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
