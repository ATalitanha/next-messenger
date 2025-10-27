import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const createMessageSchema = z.object({
  content: z.string().min(1),
  contentType: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, contentType } = createMessageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: userId,
        content,
        contentType,
      },
    });

    // The message is broadcasted through the Socket.IO server, so no need to emit here.

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const cursor = searchParams.get('cursor');

  const messages = await prisma.message.findMany({
    where: {
      conversationId: params.id,
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: {
        id: cursor,
      },
    }),
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(messages);
}
