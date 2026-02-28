const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Adding slug column to Category table...');

    // Step 1: Add the slug column as nullable first
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "slug" TEXT`);
        console.log('✅ Added slug column (nullable)');
    } catch (e) {
        console.log('ℹ️  slug column might already exist:', e.message);
    }

    // Step 2: Populate slugs for existing rows based on their name
    const categories = await prisma.$queryRawUnsafe(`SELECT id, name FROM "Category" WHERE slug IS NULL OR slug = ''`);
    console.log(`Found ${categories.length} categories without slugs`);

    for (const cat of categories) {
        const slug = cat.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        await prisma.$executeRawUnsafe(`UPDATE "Category" SET slug = $1 WHERE id = $2`, slug, cat.id);
        console.log(`  ✅ Set slug for "${cat.name}" → "${slug}"`);
    }

    // Step 3: Make the column NOT NULL
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ALTER COLUMN "slug" SET NOT NULL`);
        console.log('✅ Made slug column NOT NULL');
    } catch (e) {
        console.log('ℹ️  Column might already be NOT NULL:', e.message);
    }

    // Step 4: Add unique constraint if it doesn't exist
    try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug")`);
        console.log('✅ Added unique constraint on slug');
    } catch (e) {
        console.log('ℹ️  Unique constraint might already exist:', e.message);
    }

    console.log('\n🎉 Done! You can now run `npx prisma db push` safely.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
