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

    const { username, password } = await req.json();

    const updateData: any = {};
    if (username) updateData.name = username;
    
    if (password) {
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
