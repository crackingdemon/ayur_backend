import { prisma } from './src/lib/prisma';

async function main() {
  console.log("Deleting prescriptions...");
  await prisma.prescription.deleteMany({});
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
