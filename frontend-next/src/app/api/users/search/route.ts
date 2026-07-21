import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, prisma } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find users matching query (case-insensitive) excluding the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        status: true,
      },
      take: 20,
    });

    // Determine friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if current user sent a request
        const sentRequest = await prisma.friendship.findFirst({
          where: {
            userId: currentUser.id,
            friendId: user.id,
          },
        });

        // Check if current user received a request
        const receivedRequest = await prisma.friendship.findFirst({
          where: {
            userId: user.id,
            friendId: currentUser.id,
          },
        });

        let friendshipStatus = 'none';

        if (sentRequest) {
          if (sentRequest.status === 'accepted') {
            friendshipStatus = 'friends';
          } else if (sentRequest.status === 'pending') {
            friendshipStatus = 'pending_sent';
          }
        } else if (receivedRequest) {
          if (receivedRequest.status === 'accepted') {
            friendshipStatus = 'friends';
          } else if (receivedRequest.status === 'pending') {
            friendshipStatus = 'pending_received';
          }
        }

        return {
          ...user,
          avatar_url: user.image,
          friendship_status: friendshipStatus,
        };
      })
    );

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error('User Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
