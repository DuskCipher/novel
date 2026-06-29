import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*');

    if (error) throw error;

    const mapped = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as any);

    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { primary_color, site_name } = body;

    const updates = [];
    if (primary_color) {
      updates.push({ key: 'primary_color', value: primary_color, updated_at: new Date().toISOString() });
    }
    if (site_name) {
      updates.push({ key: 'site_name', value: site_name, updated_at: new Date().toISOString() });
    }

    if (updates.length > 0) {
      const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert(updates);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
