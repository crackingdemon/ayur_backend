import { prisma } from './src/lib/prisma';
async function main() {
  const dummies = ["Minus et et quasi mo", "Test", "Sed occaecat cillum ", "Voluptate eu fuga O", "Test User"];
  const res = await prisma.patient.deleteMany({
    where: {
      name: { in: dummies }
    }
  });
  console.log("DELETED DUMMY PATIENTS:", res.count);
}
main();
