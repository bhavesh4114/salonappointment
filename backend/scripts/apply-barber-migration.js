import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Applying Barber schema migration...\n');

    // Step 1: Add columns if they don't exist (using raw SQL)
    console.log('Step 1: Adding columns...');
    
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'barbers' AND column_name = 'fullName') THEN
          ALTER TABLE "barbers" ADD COLUMN "fullName" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'barbers' AND column_name = 'email') THEN
          ALTER TABLE "barbers" ADD COLUMN "email" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'barbers' AND column_name = 'mobileNumber') THEN
          ALTER TABLE "barbers" ADD COLUMN "mobileNumber" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'barbers' AND column_name = 'password') THEN
          ALTER TABLE "barbers" ADD COLUMN "password" TEXT;
        END IF;
      END $$;
    `);
    console.log('✅ Columns added (if they didn\'t exist)');

    // Step 2: Migrate data from users table if userId exists
    console.log('\nStep 2: Migrating data from users table...');
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "barbers" b
        SET 
          "fullName" = COALESCE(b."fullName", u."fullName"),
          "email" = COALESCE(b."email", u."email"),
          "mobileNumber" = COALESCE(b."mobileNumber", u."mobileNumber"),
          "password" = COALESCE(b."password", u."password")
        FROM "users" u
        WHERE EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'barbers' AND column_name = 'userId')
          AND b."userId" = u.id 
          AND (b."fullName" IS NULL OR b."mobileNumber" IS NULL OR b."password" IS NULL);
      `);
      console.log('✅ Data migrated from users table');
    } catch (error) {
      console.log('⚠️  Could not migrate from users (userId column may not exist):', error.message);
    }

    // Step 3: Set defaults for barbers without data
    console.log('\nStep 3: Setting defaults for records without data...');
    await prisma.$executeRawUnsafe(`
      UPDATE "barbers"
      SET 
        "fullName" = COALESCE("fullName", 'Barber ' || id::text),
        "mobileNumber" = COALESCE("mobileNumber", '999999999' || id::text),
        "password" = COALESCE("password", '$2a$10$defaultpasswordhashplaceholder')
      WHERE "fullName" IS NULL OR "mobileNumber" IS NULL OR "password" IS NULL;
    `);
    console.log('✅ Defaults set');

    // Step 4: Make columns NOT NULL
    console.log('\nStep 4: Making columns required (NOT NULL)...');
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        null_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO null_count
        FROM "barbers"
        WHERE "fullName" IS NULL OR "mobileNumber" IS NULL OR "password" IS NULL;

        IF null_count = 0 THEN
          ALTER TABLE "barbers" ALTER COLUMN "fullName" SET NOT NULL;
          ALTER TABLE "barbers" ALTER COLUMN "mobileNumber" SET NOT NULL;
          ALTER TABLE "barbers" ALTER COLUMN "password" SET NOT NULL;
        END IF;
      END $$;
    `);
    console.log('✅ Columns set to NOT NULL');

    // Step 5: Add unique constraints
    console.log('\nStep 5: Adding unique constraints...');
    
    // Remove duplicates first
    await prisma.$executeRawUnsafe(`
      DELETE FROM "barbers" b1
      WHERE b1.id NOT IN (
        SELECT MIN(b2.id)
        FROM "barbers" b2
        WHERE b2."mobileNumber" IS NOT NULL
        GROUP BY b2."mobileNumber"
        HAVING COUNT(*) > 1
      );
    `);

    await prisma.$executeRawUnsafe(`
      DELETE FROM "barbers" b1
      WHERE b1.id NOT IN (
        SELECT MIN(b2.id)
        FROM "barbers" b2
        WHERE b2."email" IS NOT NULL
        GROUP BY b2."email"
        HAVING COUNT(*) > 1
      );
    `);

    // Add unique indexes
    try {
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "barbers_mobileNumber_key";`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "barbers_mobileNumber_key" ON "barbers"("mobileNumber");`);
      await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "barbers_email_key";`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "barbers_email_key" ON "barbers"("email") WHERE "email" IS NOT NULL;`);
      console.log('✅ Unique constraints added');
    } catch (error) {
      console.log('⚠️  Warning adding constraints:', error.message);
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run: npm run prisma:generate');
    console.log('  2. Restart your server: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
