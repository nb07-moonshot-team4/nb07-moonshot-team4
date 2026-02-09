import { Prisma, SubTaskStatus, TaskStatus } from "@prisma/client";
import prisma from "../../shared/utils/prisma.js";

type TaskWithAssigneeAndTags = Prisma.TaskGetPayload<{
  include: {
    assignee: true;
    tags: { include: { tag: true } };
    attachments: true;
    subTasks: true;
  };
}>;

function toPrismaTaskStatus(status: "todo" | "in_progress" | "done"): TaskStatus {
  switch (status) {
    case "todo":
      return TaskStatus.TODO;
    case "in_progress":
      return TaskStatus.IN_PROGRESS;
    case "done":
      return TaskStatus.DONE;
  }
}

export function createTask(data: {
  title: string;
  content?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status: "todo" | "in_progress" | "done";
  attachments: string[];
  projectId: number;
  assigneeId?: number | null;
  tags: string[];
  subTasks?: string[];
}): Promise<TaskWithAssigneeAndTags> {
  return prisma.task.create({
    data: {
      title: data.title,
      content: data.content,
      startDate: data.startDate,
      endDate: data.endDate,
      status: toPrismaTaskStatus(data.status),
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      attachments: {
        create: data.attachments.map((url) => ({
          url,
          name: url.split("/").pop() || url,
        })),
      },
      subTasks: data.subTasks
        ? {
            create: data.subTasks.map((title) => ({
              title,
              status: SubTaskStatus.TODO,
            })),
          }
        : undefined,
      tags: {
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { projectId_name: { projectId: data.projectId, name: tagName } },
              create: { projectId: data.projectId, name: tagName },
            },
          },
        })),
      },
    },
    include: {
      assignee: true,
      tags: { include: { tag: true } },
      attachments: true,
      subTasks: true,
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
    orderBy?: 'createdAt' | 'title' | 'endDate',
    skip?: number,
    take?: number
  }
): Promise<TaskWithAssigneeAndTags[]> {
  const where: Prisma.TaskWhereInput = { projectId };
  if (status) where.status = toPrismaTaskStatus(status);
  if (assigneeId) where.assigneeId = assigneeId;
  if (keyword) where.title = { contains: keyword };

  return prisma.task.findMany({
    where,
    orderBy: orderBy ? { [orderBy]: order || 'asc' } : { createdAt: 'desc' },
    include: {
      assignee: true,
      tags: { include: { tag: true } },
      attachments: true,
      subTasks: true,
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
  const where: Prisma.TaskWhereInput = { projectId };
  if (status) where.status = toPrismaTaskStatus(status);
  if (assigneeId) where.assigneeId = assigneeId;
  if (keyword) where.title = { contains: keyword };

  return prisma.task.count({
    where,
  });
}

export function getTaskById(taskId: number): Promise<TaskWithAssigneeAndTags | null> {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: true,
      tags: { include: { tag: true } },
      attachments: true,
      subTasks: true,
    },
  });
}

export async function updateTask(
  taskId: number,
  data: {
    title?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    status?: "todo" | "in_progress" | "done";
    attachments?: string[];
    assigneeId?: number | null;
    tags?: string[];
    subTasks?: string[];
  }
): Promise<TaskWithAssigneeAndTags> {
  const updateData: any = {
    ...(data.title && { title: data.title }),
    ...(data.content !== undefined && { content: data.content }),
    ...(data.startDate && { startDate: data.startDate }),
    ...(data.endDate && { endDate: data.endDate }),
    ...(data.status && { status: toPrismaTaskStatus(data.status) }),
    ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
  };

  if (data.attachments) {
    updateData.attachments = {
      deleteMany: {},
      create: data.attachments.map((url) => ({
        url,
        name: url.split("/").pop() || url,
      })),
    };
  }

  if (data.subTasks) {
    updateData.subTasks = {
      deleteMany: {},
      create: data.subTasks.map((title) => ({
        title,
        status: SubTaskStatus.TODO,
      })),
    };
  }

  if (data.tags) {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (!existing) {
      throw new Error("Task not found");
    }

    updateData.tags = {
      deleteMany: {},
      create: data.tags.map((tagName) => ({
        tag: {
          connectOrCreate: {
            where: { projectId_name: { projectId: existing.projectId, name: tagName } },
            create: { projectId: existing.projectId, name: tagName },
          },
        },
      })),
    };
  }

  return prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: true,
      tags: { include: { tag: true } },
      attachments: true,
      subTasks: true,
    },
  });
}

export function deleteTask(taskId: number): Promise<TaskWithAssigneeAndTags> {
  return prisma.task.delete({
    where: { id: taskId },
    include: {
      assignee: true,
      tags: { include: { tag: true } },
      attachments: true,
      subTasks: true,
    },
  });
}

type SubTaskWithTask = Prisma.SubTaskGetPayload<{ include: { task: true } }>;

export function createSubTask(taskId: number, title: string): Promise<SubTaskWithTask> {
  return prisma.subTask.create({
    data: {
      taskId,
      title,
      status: SubTaskStatus.TODO,
    },
    include: { task: true },
  });
}

export function getSubTaskById(subTaskId: number): Promise<SubTaskWithTask | null> {
  return prisma.subTask.findUnique({
    where: { id: subTaskId },
    include: { task: true },
  });
}

export function updateSubTask(
  subTaskId: number,
  data: { title?: string; status?: SubTaskStatus }
): Promise<SubTaskWithTask> {
  return prisma.subTask.update({
    where: { id: subTaskId },
    data,
    include: { task: true },
  });
}

export function deleteSubTask(subTaskId: number): Promise<SubTaskWithTask> {
  return prisma.subTask.delete({
    where: { id: subTaskId },
    include: { task: true },
  });
}
