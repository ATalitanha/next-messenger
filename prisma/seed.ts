import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      handle: 'user1',
      hashedPassword: 'password1',
      name: 'User One',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      handle: 'user2',
      hashedPassword: 'password2',
      name: 'User Two',
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user1.id,
      content: 'Hello, User Two!',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user2.id,
      content: 'Hello, User One!',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
