-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentType" ADD VALUE 'STEPS';
ALTER TYPE "ContentType" ADD VALUE 'FOOTER';

-- AlterTable
ALTER TABLE "CMSContent" ALTER COLUMN "title" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CMSContent_page_contentType_key" ON "CMSContent"("page", "contentType");
