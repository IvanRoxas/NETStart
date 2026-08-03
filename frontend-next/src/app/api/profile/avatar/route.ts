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
      select: { image: true, name: true }
    });

    if (!user || !user.image || user.image === '/Planet 1.svg') {
      return NextResponse.redirect(new URL('/Profile.svg', req.url));
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

    // fallback for regular URLs (like Google OAuth URLs or relative paths)
    if (user.image.startsWith('/')) {
      // Encode spaces and special characters for relative paths
      const encodedPath = encodeURI(user.image);
      return NextResponse.redirect(new URL(encodedPath, req.url));
    }
    return NextResponse.redirect(user.image);
    
  } catch (error) {
    console.error('Error serving avatar:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
