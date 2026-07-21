import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, prisma } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.notification.updateMany({
      where: { 
        userId: user.id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read all error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
