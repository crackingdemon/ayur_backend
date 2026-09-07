import { prisma } from '../src/lib/prisma';
import { UserRole } from '@prisma/client';

async function main() {
  console.log("Starting data migration...");
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to migrate.`);

  let migrated = 0;
  for (const user of users) {
    try {
      // Check if membership already exists
      const existing = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: user.organizationId
          }
        }
      });

      if (!existing) {
        await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role
          }
        });
        migrated++;
        console.log(`Migrated user ${user.email}`);
      }
    } catch (e: any) {
      console.error(`Failed to migrate user ${user.email}: ${e.message}`);
    }
  }
  
  console.log(`Successfully migrated ${migrated} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
