import { del } from '@vercel/blob';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import Species from '@/models/Species';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso estritamente proibido.' }, { status: 403 });
  }

  const { id, type, fileUrl } = await req.json();

  if (!id || !type) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  try {
    await dbConnect();

    if (type === 'material') {
      await Material.findByIdAndDelete(id);
    } else {
      await Species.findByIdAndDelete(id);
    }

    if (fileUrl) {
      await del(fileUrl);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}