import { NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { image: true }
    });

    if (!user || !user.image) {
      return NextResponse.redirect(new URL('/Planet 1.svg', req.url));
    }

    // if image is a base64 string, return it directly as binary
    const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // fallback for regular URLs
    return NextResponse.redirect(user.image);
    
  } catch (error) {
    console.error('Error serving avatar:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
