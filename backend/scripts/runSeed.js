"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedDatabaseFixed_1 = require("../src/seeders/seedDatabaseFixed");
(async () => {
    try {
        console.log('Running seedDatabase...');
        await (0, seedDatabaseFixed_1.seedDatabase)();
        console.log('Seeding completed.');
        process.exit(0);
    }
    catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
})();
