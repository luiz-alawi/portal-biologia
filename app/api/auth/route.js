import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();

  const user = await User.findOne({ username, password });
  
  if (user) {
    const { password, ...userData } = user._doc;
    
    await createSession({
      _id: userData._id.toString(),
      name: userData.name,
      role: userData.role,
      turma: userData.turma
    });

    return NextResponse.json(userData);
  }
  
  return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 });
}