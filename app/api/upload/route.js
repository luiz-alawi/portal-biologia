import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem fazer upload.' }, { status: 403 });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const adminCheck = await verifyAdmin();
        if (!adminCheck) throw new Error("Não autorizado");

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload finalizado:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }
}