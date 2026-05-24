import { prisma } from './src/lib/prisma';
async function main() {
  const p = await prisma.patient.findMany();
  console.log("PATIENTS:", p.map(x => ({ id: x.id, name: x.name })));
}
main();
