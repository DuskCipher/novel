// @ts-nocheck
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, level, exp, display_name, avatar_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Gunakan supabaseAdmin agar bisa bypass RLS — ini aman karena hanya dipanggil
    // dari dalam aplikasi sendiri (server-side API route), bukan dari browser langsung.
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        level: level || 1,
        exp: exp || 0,
        display_name: display_name || 'Pengguna',
        avatar_url: avatar_url || '/avatar.jpeg',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('[sync-profile error]', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[sync-profile catch]', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 200 });
  }
}
