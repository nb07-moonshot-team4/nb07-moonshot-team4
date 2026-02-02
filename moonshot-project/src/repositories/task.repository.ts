import { Tasks } from "@prisma/client";
import prisma from "../utils/prisma";

export function createTask(data: Omit<Tasks, 'id' | 'createdAt' | 'updatedAt'> & { tags: string[] }): Promise<Tasks> {
  return prisma.tasks.create({
    data: {
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      attachments: data.attachments,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      tags: {
        connectOrCreate: data.tags.map((tagName) => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      },
    },
    include: {
      assignee: true,
      tags: true,
    },
  });
}

export function getTasksByProjectId(
  projectId: number,
  {
    status,
    assigneeId,
    keyword,
    order,
    orderBy,
    skip = 0,
    take = 10
  }: {
    status?: "todo" | "in_progress" | "done",
    assigneeId?: number,
    keyword?: string,
    order?: 'asc' | 'desc',
    orderBy?: 'createdAt' | 'name' | 'endDate',
    skip?: number,
    take?: number
  }
): Promise<Tasks[]> {
  return prisma.tasks.findMany({
    where: { projectId, status, assigneeId, title: { contains: keyword } },
    orderBy: orderBy ? { [orderBy]: order || 'asc' } : { createdAt: 'desc' },
    include: {
      assignee: true,
      tags: true,
    },
    skip: skip,
    take: take,
  });
}

export function countTasksByProjectId(
   projectId: number,
  {
    status,
    assigneeId,
    keyword,
  }: {
    status?: "todo" | "in_progress" | "done",
    assigneeId?: number,
    keyword?: string,
  }
): Promise<number> {
  return prisma.tasks.count({
    where: { projectId, status, assigneeId, title: { contains: keyword } },
  });
}