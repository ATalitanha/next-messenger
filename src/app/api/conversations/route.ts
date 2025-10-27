import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const createConversationSchema = z.object({
  participants: z.array(z.string().cuid()),
  isGroup: z.boolean().optional(),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { participants, isGroup, title } = createConversationSchema.parse(body);

    const allParticipants = [...participants, userId];

    const conversation = await prisma.conversation.create({
      data: {
        isGroup,
        title,
        participants: {
          create: allParticipants.map((id) => ({ userId: id })),
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid request body', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              handle: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return NextResponse.json(conversations);
}
