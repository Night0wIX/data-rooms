-- CreateEnum
CREATE TYPE "ShareResourceType" AS ENUM ('DATA_ROOM', 'FOLDER', 'FILE');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('PUBLIC', 'USER');

-- CreateEnum
CREATE TYPE "ShareRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateTable
CREATE TABLE "shares" (
    "id" TEXT NOT NULL,
    "resourceType" "ShareResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "shareType" "ShareType" NOT NULL,
    "role" "ShareRole" NOT NULL DEFAULT 'VIEWER',
    "sharedWithUserId" TEXT,
    "token" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shares_token_key" ON "shares"("token");

-- CreateIndex
CREATE INDEX "shares_resourceType_resourceId_revokedAt_idx" ON "shares"("resourceType", "resourceId", "revokedAt");

-- CreateIndex
CREATE INDEX "shares_sharedWithUserId_idx" ON "shares"("sharedWithUserId");

-- CreateIndex
CREATE UNIQUE INDEX "shares_resourceType_resourceId_sharedWithUserId_key" ON "shares"("resourceType", "resourceId", "sharedWithUserId");

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
