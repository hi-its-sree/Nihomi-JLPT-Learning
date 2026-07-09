import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
(async () => {
  const rows = await db.grammarPattern.findMany({ take: 1 });
  console.log(JSON.stringify(rows, null, 2));
  await db.$disconnect();
})();
