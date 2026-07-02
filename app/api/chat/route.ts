import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, content, reply_to, reply_to_username, level, level_text, avatar_url, display_name, role, is_verified, audio_url } = body;

    if (!user_id || (!content && !audio_url)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. RATE LIMITING CHECK
    // Check if the user has sent a message in the last 3 seconds
    const threeSecondsAgo = new Date(Date.now() - 3000).toISOString();
    
    const { data: recentMessages, error: rateLimitError } = await supabaseAdmin
      .from('global_messages')
      .select('id, created_at')
      .eq('user_id', user_id)
      .gte('created_at', threeSecondsAgo)
      .limit(1);

    if (rateLimitError) {
      console.error('[Rate limit check error]', rateLimitError);
    }

    if (recentMessages && recentMessages.length > 0) {
      return NextResponse.json({ error: 'Tunggu beberapa detik sebelum mengirim pesan lagi (Anti-Spam).' }, { status: 429 });
    }

    // 2. SECURITY CHECK: Verify user actually has these roles/verified status in DB
    // We don't trust the client payload for role and is_verified
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_verified')
      .eq('id', user_id)
      .single();

    // 3. INSERT MESSAGE
    const msgData = {
      user_id,
      content: content ? content.trim().substring(0, 1000) : '', // Max 1000 chars
      reply_to: reply_to || null,
      reply_to_username: reply_to_username || null,
      level: level || 1,
      level_text: level_text || 'Rookie',
      avatar_url: avatar_url || null,
      display_name: display_name || 'Pengguna',
      audio_url: audio_url || null,
      // Force use DB values to prevent injection
      role: profile?.role || 'user',
      is_verified: profile?.is_verified || false
    };

    const { data: newMsg, error: insertError } = await supabaseAdmin
      .from('global_messages')
      .insert([msgData])
      .select()
      .single();

    if (insertError) {
      console.error('[Insert message error]', insertError);
      return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error('[Chat API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
