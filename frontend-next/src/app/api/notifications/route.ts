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

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const formattedNotifs = notifications.map(notif => ({
      id: notif.id,
      type: notif.notificationType,
      read_at: notif.readAt,
      created_at: notif.createdAt,
      sender_id: notif.senderId,
      data: notif.data,
      sender: notif.sender ? {
        id: notif.sender.id,
        name: notif.sender.name,
        avatar_url: notif.sender.image
      } : null
    }));

    return NextResponse.json({ notifications: formattedNotifs });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
