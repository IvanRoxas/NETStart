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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Valid notification ids required' }, { status: 400 });
    }

    if (action === 'delete') {
      const deleted = await prisma.notification.deleteMany({
        where: {
          id: { in: ids },
          userId: user.id
        }
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }

    if (action === 'mark_read') {
      const updated = await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: user.id
        },
        data: {
          readAt: new Date()
        }
      });
      return NextResponse.json({ success: true, count: updated.count });
    }

    if (action === 'mark_unread') {
      const updated = await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: user.id
        },
        data: {
          readAt: null
        }
      });
      return NextResponse.json({ success: true, count: updated.count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Batch notification operation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
