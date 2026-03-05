import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  await dbConnect();
  const users = await User.find({}).select('-password').sort({ name: 1 });
  return NextResponse.json(users);
}

export async function POST(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  await dbConnect();
  const { name, username, turma, role } = await req.json();

  const exists = await User.findOne({ username });
  if (exists) {
    return NextResponse.json({ error: 'Este nome de usuário já está em uso.' }, { status: 400 });
  }

  const randomPassword = Math.random().toString(36).slice(-6);

  const newUser = await User.create({
    name,
    username,
    turma,
    role: role || 'student',
    password: randomPassword
  });

  return NextResponse.json({ ...newUser._doc, generatedPassword: randomPassword });
}

export async function DELETE(req) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

  await User.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}