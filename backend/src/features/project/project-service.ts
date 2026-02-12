import prisma from "../../shared/utils/prisma.js";

export const createProject = async (userId: number, body: { name: string; description: string },) => {

  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      ownerId: userId,
      members: {
        create: {
          userId: userId,
          role: "ADMIN",
          status: "ACTIVE",
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          tasks: true,
        },
      },
    },
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    memberCount: project._count.members,
    todoCount: 0,
    inProgressCount: 0,
    doneCount: 0,
  };
};

export const getProjectById = async (projectId: number) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!project) {
    throw { status: 404, message: "프로젝트를 찾을 수 없습니다." };
  }

  const taskCounts = await prisma.task.groupBy({
    by: ["status"],
    where: { projectId },
    _count: true,
  });

  const countMap = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };

  taskCounts.forEach((item) => {
    countMap[item.status as keyof typeof countMap] = item._count;
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    memberCount: project._count.members,
    todoCount: countMap.TODO,
    inProgressCount: countMap.IN_PROGRESS,
    doneCount: countMap.DONE,
  };
};

export const updateProject = async (
  projectId: number,
  body: { name?: string; description?: string },
) => {
  if (!body.name && !body.description) {
    throw { status: 400, message: "잘못된 데이터 형식" };
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description && { description: body.description }),
    },
  });

  return updated;
};

export const deleteProject = async (projectId: number) => {
  await prisma.project.delete({
    where: { id: projectId },
  });
};
