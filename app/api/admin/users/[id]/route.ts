// @ts-nocheck
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { level, exp, role, is_banned, ban_reason } = body;

    if (level === undefined && exp === undefined && role === undefined && is_banned === undefined && ban_reason === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (level !== undefined) updateData.level = Number(level);
    if (exp !== undefined) updateData.exp = Number(exp);
    if (is_banned !== undefined) updateData.is_banned = Boolean(is_banned);
    if (ban_reason !== undefined) updateData.ban_reason = ban_reason;

    // 1. Update tabel profiles (level, exp, is_banned, ban_reason)
    if (level !== undefined || exp !== undefined || is_banned !== undefined || ban_reason !== undefined) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', id)
        .single();

      let profileError = null;
      if (existingProfile) {
        const { error } = await supabaseAdmin.from('profiles').update(updateData).eq('id', id);
        profileError = error;
      } else {
        const { error } = await supabaseAdmin.from('profiles').insert({ id, ...updateData });
        profileError = error;
      }

      if (profileError) {
        console.error('[PUT admin/users profileError]', profileError);
        return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
      }
    }

    // 2. Update auth user metadata agar sinkron (jika service role key tersedia)
    const metaUpdate: any = {};
    if (level !== undefined) metaUpdate.level = Number(level);
    if (exp !== undefined) metaUpdate.exp = Number(exp);
    if (role !== undefined) metaUpdate.role = role;

    try {
      // Perlu baca metadata saat ini dulu agar tidak tertimpa
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(id);
      const currentMeta = user?.user_metadata || {};
      
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { ...currentMeta, ...metaUpdate }
      });
    } catch (adminError: any) {
      console.error('[PUT admin/users] Gagal update auth metadata:', adminError);
      return NextResponse.json({ success: false, error: adminError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: updateData });
  } catch (error: any) {
    console.error('[PUT admin/users catch]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const errors: string[] = [];

    // 1. Hapus auth user TERLEBIH DAHULU
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) {
        console.error('[DELETE admin/users] auth delete error:', authError);
        errors.push(`Auth: ${authError.message}`);
      }
    } catch (adminError: any) {
      console.error('[DELETE admin/users] auth delete catch:', adminError);
      errors.push(`Auth: ${adminError.message}`);
    }

    // 2. Hapus komentar user
    const { error: commentError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('user_id', id);
    
    if (commentError) {
      console.error('[DELETE admin/users] comments delete error:', commentError);
      errors.push(`Comments: ${commentError.message}`);
    }

    // 3. Hapus dari tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (profileError) {
      console.error('[DELETE admin/users] profile delete error:', profileError);
      errors.push(`Profile: ${profileError.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Beberapa data gagal dihapus (pastikan SUPABASE_SERVICE_ROLE_KEY di Vercel sudah benar): ${errors.join('; ')}` 
      }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE admin/users catch]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
