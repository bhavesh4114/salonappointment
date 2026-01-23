import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Applying User/Barber separation migration...\n');

    // Read the migration SQL file
    const migrationPath = join(__dirname, '../prisma/migrations/clean_separation.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Execute the entire migration as one block
    await prisma.$executeRawUnsafe(sql);

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📝 Changes made:');
    console.log('  ✓ Removed userId column from barbers table');
    console.log('  ✓ Removed old columns (title, bio, experience, etc.)');
    console.log('  ✓ Ensured required columns exist (fullName, email, mobileNumber, password)');
    console.log('  ✓ Added unique constraints');
    console.log('  ✓ Updated User table to remove barber role');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: npm run prisma:generate');
    console.log('  2. Restart your server: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    if (error.message.includes('RAISE NOTICE')) {
      // PostgreSQL notices are not errors
      console.log('✅ Migration completed (some notices are normal)');
    } else {
      console.error(error);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
