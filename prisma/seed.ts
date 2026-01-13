import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { email: 'admin@trainee-wallet.com' },
        update: {},
        create: {
            email: 'admin@trainee-wallet.com',
            password: 'CHANGE_ME',
            role: 'ADMIN',
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
