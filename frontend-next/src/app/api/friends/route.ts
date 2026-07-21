import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, prisma } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Get all friendships where this user is involved
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      include: {
        user: { select: { id: true, name: true, image: true, status: true } },
        friend: { select: { id: true, name: true, image: true, status: true } }
      }
    });

    const friends = friendships
      .filter(f => f.status === 'accepted')
      .map(f => f.userId === userId ? f.friend : f.user);

    const pendingSent = friendships
      .filter(f => f.status === 'pending' && f.userId === userId)
      .map(f => ({ friendshipId: f.id, user: f.friend }));

    const pendingReceived = friendships
      .filter(f => f.status === 'pending' && f.friendId === userId)
      .map(f => ({ friendshipId: f.id, user: f.user }));

    return NextResponse.json({ friends, pendingSent, pendingReceived });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { targetUserId } = await req.json();

    if (userId === targetUserId) {
      return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: targetUserId },
          { userId: targetUserId, friendId: userId }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Friendship or request already exists' }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        userId: userId,
        friendId: targetUserId,
        status: 'pending'
      }
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        senderId: userId,
        notificationType: 'friend_request',
        data: { friendshipId: friendship.id }
      }
    });

    return NextResponse.json({ message: 'Friend request sent', friendship });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { friendshipId } = await req.json();

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship || friendship.friendId !== userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' }
    });

    await prisma.notification.create({
      data: {
        userId: friendship.userId,
        senderId: userId,
        notificationType: 'friend_accepted',
      }
    });

    return NextResponse.json({ message: 'Friend request accepted', friendship: updated });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');
    const friendshipId = searchParams.get('friendshipId');

    if (friendshipId) {
       await prisma.friendship.deleteMany({
          where: {
            id: friendshipId,
            OR: [{ userId: userId }, { friendId: userId }]
          }
       });
       return NextResponse.json({ message: 'Request removed' });
    } else if (targetUserId) {
       await prisma.friendship.deleteMany({
          where: {
            OR: [
              { userId: userId, friendId: targetUserId },
              { userId: targetUserId, friendId: userId }
            ]
          }
       });
       return NextResponse.json({ message: 'Friend removed' });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
