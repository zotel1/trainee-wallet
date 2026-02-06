import { PrismaService } from '../../src/prisma/prisma.service';

export async function cleanupUserData(prisma: PrismaService, userIds: string[]) {
  if (userIds.length === 0) return;

  // 1) hijos
  await prisma.transaction.deleteMany({
    where: { account: { userId: { in: userIds } } },
  });

  // 2) accounts
  await prisma.account.deleteMany({
    where: { userId: { in: userIds } },
  });

  // 3) users
  await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
}
