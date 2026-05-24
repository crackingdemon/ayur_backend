import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.patient.findMany();
  console.log(p.map(x => x.name));
}
main();
