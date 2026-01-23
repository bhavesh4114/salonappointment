import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function removeUserId() {
  try {
    console.log('🔄 Removing userId from Barber table...\n');

    // Step 1: Drop foreign key constraint
    console.log('Step 1: Dropping foreign key constraint...');
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'barbers' 
            AND constraint_name LIKE '%userId%'
            AND constraint_type = 'FOREIGN KEY'
          ) THEN
            ALTER TABLE "barbers" DROP CONSTRAINT IF EXISTS "barbers_userId_fkey";
            RAISE NOTICE 'Dropped foreign key constraint';
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key constraint dropped');
    } catch (error) {
      console.log('⚠️  Foreign key may not exist:', error.message);
    }

    // Step 2: Drop unique constraint
    console.log('\nStep 2: Dropping unique constraint...');
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'barbers' 
            AND constraint_name LIKE '%userId%'
            AND constraint_type = 'UNIQUE'
          ) THEN
            ALTER TABLE "barbers" DROP CONSTRAINT IF EXISTS "barbers_userId_key";
            RAISE NOTICE 'Dropped unique constraint';
          END IF;
        END $$;
      `);
      console.log('✅ Unique constraint dropped');
    } catch (error) {
      console.log('⚠️  Unique constraint may not exist:', error.message);
    }

    // Step 3: Drop indexes
    console.log('\nStep 3: Dropping indexes...');
    try {
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "barbers_userId_key";`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "barbers_userId_idx";`);
      console.log('✅ Indexes dropped');
    } catch (error) {
      console.log('⚠️  Indexes may not exist:', error.message);
    }

    // Step 4: Drop the column
    console.log('\nStep 4: Dropping userId column...');
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'barbers' AND column_name = 'userId'
          ) THEN
            ALTER TABLE "barbers" DROP COLUMN "userId";
            RAISE NOTICE 'Removed userId column';
          ELSE
            RAISE NOTICE 'userId column does not exist';
          END IF;
        END $$;
      `);
      console.log('✅ userId column removed');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('✅ userId column already removed');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: npm run prisma:generate');
    console.log('  2. Restart your server: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error removing userId:', error.message);
    if (!error.message.includes('RAISE NOTICE')) {
      console.error(error);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

removeUserId();
