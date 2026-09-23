-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TENANT_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nif" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_nif_key" ON "User"("nif");
