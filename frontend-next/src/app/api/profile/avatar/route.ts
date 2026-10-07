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

    if (!user || !user.image || user.image === '/assets/planets/celestial/Planet 1.svg') {
      return NextResponse.redirect(new URL('/assets/global/badges/Profile.svg', req.url));
    }

    const ALLOWED_IMAGE_TYPES = new Set([
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ]);

    // if image is a base64 string, return it directly as binary
    const matches = user.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1].toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.has(type)) {
        return NextResponse.redirect(new URL('/assets/global/badges/Profile.svg', req.url));
      }

      const buffer = Buffer.from(matches[2], 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'",
        },
      });
    }

    // fallback for regular URLs (like Google OAuth URLs or relative paths)
    if (user.image.startsWith('/')) {
      // Encode spaces and special characters for relative paths
      const encodedPath = encodeURI(user.image);
      return NextResponse.redirect(new URL(encodedPath, req.url));
    }

    try {
      const parsedExternalUrl = new URL(user.image);
      if (parsedExternalUrl.protocol === 'http:' || parsedExternalUrl.protocol === 'https:') {
        return NextResponse.redirect(parsedExternalUrl.toString());
      }
    } catch {
      // Invalid URL format
    }

    return NextResponse.redirect(new URL('/assets/global/badges/Profile.svg', req.url));
    
  } catch (error) {
    console.error('Error serving avatar:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
