import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, prisma } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password';
import { logSystemAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, currentPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (username && username !== user.name) {
      const existing = await prisma.user.findFirst({
        where: {
          name: { equals: username, mode: 'insensitive' },
          id: { not: user.id },
        },
      });
      if (existing) {
        return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
      }
      updateData.name = username;
    }
    
    if (password) {
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json({ message: 'Current password is required to set a new password' }, { status: 400 });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
        }
      }
      const passwordError = validatePassword(password);
      if (passwordError) {
        return NextResponse.json({ message: passwordError }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    await logSystemAction({
      actorId: updatedUser.id,
      actorRole: "STUDENT",
      action: "UPDATED_SETTINGS",
      details: { 
        updatedFields: Object.keys(updateData) 
      }
    });

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
