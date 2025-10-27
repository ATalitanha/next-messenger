import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

const prisma = new PrismaClient();

const createReactionSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content } = createReactionSchema.parse(body);

    const reaction = await prisma.reaction.create({
      data: {
        messageId: params.messageId,
        userId,
        content,
      },
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reactionId = searchParams.get('reactionId');

  if (!reactionId) {
    return NextResponse.json({ message: 'Reaction ID is required' }, { status: 400 });
  }

  try {
    await prisma.reaction.delete({
      where: {
        id: reactionId,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
