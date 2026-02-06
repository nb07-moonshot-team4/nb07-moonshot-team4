import { prisma } from "../../prisma/prisma-client.js"
import { MemberStatus, Role } from "@prisma/client";

function generateInvitationId(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10)
  );
}

export class MemberRepo {
  async findProject(projectId: number) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true },
    });
  }

  async isActiveMember(projectId: number, userId: number): Promise<boolean> {
    const row = await prisma.projectMember.findFirst({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
      select: { userId: true, role: true, status: true },
    });
    return !!row;
  }


  async findActiveMember(projectId: number, userId: number) {
    return prisma.projectMember.findFirst({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
      select: { userId: true, role: true, status: true },
    });
  }

  async findMembersPaged(projectId: number, skip: number, take: number) {
    const where = { projectId, status: { not: MemberStatus.LEFT } };

    const [total, rows] = await prisma.$transaction([
      prisma.projectMember.count({ where }),
      prisma.projectMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }],
        skip,
        take,
      }),
    ]);

    return { total, rows };
  }

  async findMember(projectId: number, userId: number) {
    return prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        status: { not: MemberStatus.LEFT },
      },
      select: { userId: true, role: true, status: true },
    });
  }

  async markMemberLeft(projectId: number, userId: number) {
    await prisma.projectMember.updateMany({
      where: { projectId, userId },
      data: { status: MemberStatus.LEFT },
    });
  }


  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }

  async findMemberAnyStatus(projectId: number, userId: number) {
    return prisma.projectMember.findFirst({
      where: { projectId, userId },
      select: { userId: true, status: true },
    });
  }

  async upsertInvitationMember(projectId: number, userId: number) {
    const invitationId = generateInvitationId();

    await prisma.projectMember.upsert({
      where: {
        userId_projectId: { userId, projectId },
      },
      create: {
        projectId,
        userId,
        role: Role.MEMBER,
        status: MemberStatus.INVITED,
        invitationId,
        joinedAt: null,
      },
      update: {
        role: Role.MEMBER,
        status: MemberStatus.INVITED,
        invitationId,
        joinedAt: null,
      },
    });

    return invitationId;
  }

  async countTasksByAssignee(projectId: number, userIds: number[]) {
    if (userIds.length === 0) return new Map<number, number>();

    const grouped = await prisma.task.groupBy({
      by: ["assigneeId"],
      where: { projectId, assigneeId: { in: userIds } },
      _count: { _all: true },
    });

    const map = new Map<number, number>();
    for (const g of grouped) {
      if (g.assigneeId != null) {
        map.set(g.assigneeId, g._count._all);
      }
    }
    return map;
  }

  //todo invitationId String? @unique 스키마 유니크키 변경 
  async findMemberByInvitationId(invitationId: string) {
    return prisma.projectMember.findUnique({
      where: { invitationId },
      select: {
        projectId: true,
        userId: true,
        status: true,
        invitationId: true,
      },
    });
  }
  //초대수락 
  async acceptInvitation(invitationId: string) {
    await prisma.projectMember.update({
      where: { invitationId },
      data: {
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
        invitationId: null,
      },
    });
  }
  //초대삭제
  async cancelInvitation(invitationId: string) {
    await prisma.projectMember.update({
      where: { invitationId },
      data: {
        status: MemberStatus.REJECTED,
        invitationId: null,
        joinedAt: null,
      },
    });
  }
}

