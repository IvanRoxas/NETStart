import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, prisma } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const count = await prisma.notification.count({
      where: { 
        userId: user.id,
        readAt: null
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Fetch unread count error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
