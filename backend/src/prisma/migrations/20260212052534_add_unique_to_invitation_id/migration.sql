/*
  Warnings:

  - A unique constraint covering the columns `[invitationId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,projectId]` on the table `ProjectMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProjectMember_userId_projectId_invitationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_invitationId_key" ON "ProjectMember"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "ProjectMember"("userId", "projectId");
