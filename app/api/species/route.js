import dbConnect from '@/lib/db';
import Species from '@/models/Species';
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
    const species = await Species.find(query).sort({ createdAt: -1 });
    return NextResponse.json(species);
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
  
  const species = await Species.create(data);
  return NextResponse.json(species);
}