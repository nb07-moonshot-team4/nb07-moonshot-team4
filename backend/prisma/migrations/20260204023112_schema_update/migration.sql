/*
  Warnings:

  - The `status` column on the `ProjectMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `SubTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `endDay` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `endMonth` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `endYear` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startDay` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startMonth` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startYear` on the `Task` table. All the data in the column will be lost.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[token]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Attachment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'REJECTED', 'LEFT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BACKLOG');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubTask" DROP CONSTRAINT "SubTask_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TaskTag" DROP CONSTRAINT "TaskTag_taskId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuthProvider" DROP CONSTRAINT "UserAuthProvider_userId_fkey";

-- DropIndex
DROP INDEX "Tag_name_key";

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "color" TEXT,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER',
DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'INVITED';

-- AlterTable
ALTER TABLE "SubTask" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "color" TEXT,
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "endDay",
DROP COLUMN "endMonth",
DROP COLUMN "endYear",
DROP COLUMN "startDay",
DROP COLUMN "startMonth",
DROP COLUMN "startYear",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "startDate" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "Comment_taskId_idx" ON "Comment"("taskId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_projectId_name_key" ON "Tag"("projectId", "name");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- AddForeignKey
ALTER TABLE "UserAuthProvider" ADD CONSTRAINT "UserAuthProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTask" ADD CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
