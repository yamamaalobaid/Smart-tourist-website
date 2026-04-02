import { seedDatabase } from '../src/seeders/seedDatabaseFixed';

(async () => {
  try {
    console.log('Running seedDatabase...');
    await seedDatabase();
    console.log('Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
