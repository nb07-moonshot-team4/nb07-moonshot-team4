import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding start...");

  // 1. User + AuthProvider
  const user = await prisma.user.create({
    data: {
      email: "testuser@example.com",
      name: "테스트유저",
      authProviders: {
        create: {
          provider: "local",
          providerUserId: "testuser@example.com",
          passwordHash: "hashed-password",
        },
      },
    },
  });

  // 2. Project (owner 필수)
  const project = await prisma.project.create({
    data: {
      name: "Moonshot 프로젝트",
      description: "Seed 테스트용 프로젝트",
      ownerId: user.id,
    },
  });

  // 3. ProjectMember (enum 사용)
  await prisma.projectMember.create({
    data: {
      userId: user.id,
      projectId: project.id,
      role: "OWNER",
      status: "ACTIVE",
      invitationId: "seed-invite",
    },
  });

  // 4. Tag (projectId 필수)
  const backendTag = await prisma.tag.create({
    data: {
      name: "backend",
      color: "#3b82f6",
      projectId: project.id,
    },
  });

  // 5. Task (creatorId 필수, 날짜는 DateTime)
  const task = await prisma.task.create({
    data: {
      title: "Seed 데이터 연결하기",
      content: "Prisma Seed 테스트용 Task",
      projectId: project.id,
      assigneeId: user.id,
      creatorId: user.id,
      status: "TODO",
      priority: "MEDIUM",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-04-10"),
    },
  });

  // 6. TaskTag (M:N)
  await prisma.taskTag.create({
    data: {
      taskId: task.id,
      tagId: backendTag.id,
    },
  });

  console.log("✅ Seed 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
