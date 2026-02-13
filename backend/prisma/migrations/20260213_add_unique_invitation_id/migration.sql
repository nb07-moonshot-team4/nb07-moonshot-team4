-- Add unique constraint for invitationId on ProjectMember
CREATE UNIQUE INDEX "ProjectMember_invitationId_key"
ON "ProjectMember"("invitationId");
