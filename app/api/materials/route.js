import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const turma = searchParams.get('turma');

  let query = {};

  if (turma && turma !== 'STAFF') {
    query = { 
      $or: [
        { turma: turma }, 
        { turma: 'Todas' }
      ] 
    };
  }

  try {
    const materials = await Material.find(query).sort({ createdAt: -1 });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado. Você não é Admin.' }, { status: 403 });
  }

  await dbConnect();
  const data = await req.json();
  
  const material = await Material.create(data);
  return NextResponse.json(material);
}