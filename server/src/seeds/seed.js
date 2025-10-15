// seed.js
import { PrismaClient } from '@prisma/client';
import { seedLogs, seedAlertRules, seedAlerts } from './seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  try {
    // Clear existing data (optional - be careful in production)
    console.log('Clearing existing data...');
    await prisma.alert.deleteMany();
    await prisma.alertRule.deleteMany();
    await prisma.log.deleteMany();

    // Seed Logs
    console.log('Seeding logs...');
    for (const logData of seedLogs) {
      await prisma.log.create({
        data: logData
      });
    }
    console.log(`✅ Created ${seedLogs.length} logs`);

    // Seed Alert Rules
    console.log('Seeding alert rules...');
    for (const ruleData of seedAlertRules) {
      await prisma.alertRule.create({
        data: ruleData
      });
    }
    console.log(`✅ Created ${seedAlertRules.length} alert rules`);

    // Seed Alerts
    console.log('Seeding alerts...');
    for (const alertData of seedAlerts) {
      await prisma.alert.create({
        data: alertData
      });
    }
    console.log(`✅ Created ${seedAlerts.length} alerts`);

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });