import CrudTaskApi from "./task-mapper.js";
import * as taskRepo from "./task-repository.js";
import * as projectRepo from "../project/project-repository.js";
import {
  CreateSubTaskDto,
  CreateTaskDto,
  GetTasksResponseDto,
  SubTaskDto,
  toSubTaskDto,
  TaskDto,
  UpdateSubTaskDto,
  UpdateTaskDto,
} from "./task-dto.js";
import { SubTaskStatus } from "@prisma/client";
import * as googleCalendarService from "./google-calendar-service.js";
import {
  parseNaturalLanguageToTask,
  convertParsedToCreateTaskDto,
} from "./task-ai-create.js";

export const createTask = async (
  userId: number,
  projectId: number,
  data: CreateTaskDto,
): Promise<TaskDto> => {
  const targetProject = await projectRepo.getProjectById(projectId);
  if (!targetProject) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }
  const isProjectMember = await projectRepo.isProjectMember(userId, projectId);
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  if (!data.title || data.title.trim() === "") {
    throw { status: 400, message: "제목은 필수입니다" };
  }

  const startDate = new Date(
    data.startYear,
    data.startMonth - 1,
    data.startDay,
  );
  const endDate = new Date(data.endYear, data.endMonth - 1, data.endDay);

  if (endDate < startDate) {
    throw { status: 400, message: "종료일이 시작일보다 빠를 수 없습니다" };
  }

  const taskStatus = data.status || "todo";

  const createdTask = await taskRepo.createTask({
    title: data.title,
    description: data.description,
    projectId: projectId,
    assigneeId: userId,
    status: taskStatus,
    attachments: data.attachments,
    tags: data.tags,
    subTasks: data.subTasks,
    startDate: startDate,
    endDate: endDate,
  });

  if (startDate && endDate) {
    try {
      await googleCalendarService.createCalendarEvent(
        userId,
        createdTask.id,
        data.title,
        startDate,
        endDate,
        data.description || undefined,
      );
    } catch (error) {
      console.error("구글 캘린더 동기화 실패:", error);
    }
  }

  return CrudTaskApi(createdTask);
};

export const getTasksByProjectId = async (
  userId: number,
  projectId: number,
  page: number = 1,
  limit: number = 10,
  queryFilters?: {
    status?: "todo" | "in_progress" | "done";
    assigneeId?: number;
    keyword?: string;
    order?: "asc" | "desc";
    orderBy?: "created_at" | "name" | "end_date";
  },
): Promise<GetTasksResponseDto> => {
  const targetProject = await projectRepo.getProjectById(projectId);
  if (!targetProject) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const isProjectMember = await projectRepo.isProjectMember(userId, projectId);
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }
  const skip = (page - 1) * limit;
  const take = limit;

  let prismaOrderByField: "createdAt" | "title" | "endDate" | undefined;
  if (queryFilters?.orderBy) {
    if (queryFilters.orderBy === "created_at") prismaOrderByField = "createdAt";
    else if (queryFilters.orderBy === "name") prismaOrderByField = "title";
    else if (queryFilters.orderBy === "end_date")
      prismaOrderByField = "endDate";
  }

  const tasks = await taskRepo.getTasksByProjectId(projectId, {
    status: queryFilters?.status,
    assigneeId: queryFilters?.assigneeId,
    keyword: queryFilters?.keyword,
    order: queryFilters?.order,
    orderBy: prismaOrderByField,
    skip: skip,
    take: take,
  });
  const total = await taskRepo.countTasksByProjectId(projectId, {
    status: queryFilters?.status,
    assigneeId: queryFilters?.assigneeId,
    keyword: queryFilters?.keyword,
  });

  return {
    data: tasks.map((task) => CrudTaskApi(task)),
    total,
  };
};

export const getTask = async (
  userId: number,
  taskId: number,
): Promise<TaskDto> => {
  const task = await taskRepo.getTaskById(taskId);

  if (!task) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const isMember = await projectRepo.isProjectMember(userId, task.projectId);
  if (!isMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  return CrudTaskApi(task);
};

export const updateTask = async (
  taskId: number,
  userId: number,
  data: UpdateTaskDto,
): Promise<TaskDto> => {
  const existingTask = await taskRepo.getTaskById(taskId);

  if (!existingTask) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    existingTask.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  const updateData: any = {};

  if (data.title !== undefined) {
    if (data.title.trim() === "") {
      throw { status: 400, message: "제목은 필수입니다" };
    }
    updateData.title = data.title;
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status) updateData.status = data.status;
  if (data.attachments) updateData.attachments = data.attachments;
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
  if (data.tags) updateData.tags = data.tags;
  if (data.subTasks) updateData.subTasks = data.subTasks;

  if (
    data.startYear !== undefined &&
    data.startMonth !== undefined &&
    data.startDay !== undefined
  ) {
    updateData.startDate = new Date(
      data.startYear,
      data.startMonth - 1,
      data.startDay,
    );
  }

  if (
    data.endYear !== undefined &&
    data.endMonth !== undefined &&
    data.endDay !== undefined
  ) {
    updateData.endDate = new Date(data.endYear, data.endMonth - 1, data.endDay);
  }

  const startDate = updateData.startDate || existingTask.startDate;
  const endDate = updateData.endDate || existingTask.endDate;

  if (endDate < startDate) {
    throw { status: 400, message: "종료일이 시작일보다 빠를 수 없습니다" };
  }

  const updatedTask = await taskRepo.updateTask(taskId, updateData);

  if (existingTask.googleEventId && startDate && endDate) {
    try {
      await googleCalendarService.updateCalendarEvent(
        userId,
        taskId,
        existingTask.googleEventId,
        updateData.title || existingTask.title,
        startDate,
        endDate,
        updateData.description !== undefined
          ? updateData.description
          : existingTask.description || undefined,
      );
    } catch (error) {
      console.error("구글 캘린더 업데이트 실패:", error);
    }
  } else if (!existingTask.googleEventId && startDate && endDate) {
    try {
      await googleCalendarService.createCalendarEvent(
        userId,
        taskId,
        updateData.title || existingTask.title,
        startDate,
        endDate,
        updateData.description !== undefined
          ? updateData.description
          : existingTask.description || undefined,
      );
    } catch (error) {
      console.error("구글 캘린더 생성 실패:", error);
    }
  }

  return CrudTaskApi(updatedTask);
};

export const deleteTask = async (taskId: number, userId: number) => {
  const existingTask = await taskRepo.getTaskById(taskId);

  if (!existingTask) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    existingTask.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  if (existingTask.googleEventId) {
    try {
      await googleCalendarService.deleteCalendarEvent(
        userId,
        existingTask.googleEventId,
      );
    } catch (error) {
      console.error("구글 캘린더 삭제 실패:", error);
    }
  }

  await taskRepo.deleteTask(taskId);
  return null;
};

export const createSubTask = async (
  userId: number,
  taskId: number,
  data: CreateSubTaskDto,
): Promise<SubTaskDto> => {
  const parentTask = await taskRepo.getTaskById(taskId);
  if (!parentTask) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    parentTask.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  if (!data.title || data.title.trim() === "") {
    throw { status: 400, message: "잘못된 요청 형식" };
  }

  const status = data.status || "todo";
  const created = await taskRepo.createSubTask(taskId, data.title, status);
  return toSubTaskDto(created);
};

export async function getSubTasksByTaskId(
  userId: number,
  taskId: number,
): Promise<SubTaskDto[]> {
  const parentTask = await taskRepo.getTaskById(taskId);
  if (!parentTask) {
    throw { status: 404, message: "할 일을 찾을 수 없습니다" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    parentTask.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  const subTasks = await taskRepo.getSubTasksByTaskId(taskId);

  return subTasks.map((subTask) => toSubTaskDto(subTask));
}

export const updateSubTask = async (
  userId: number,
  subTaskId: number,
  data: UpdateSubTaskDto,
): Promise<SubTaskDto> => {
  const existing = await taskRepo.getSubTaskById(subTaskId);
  if (!existing) {
    throw { status: 404, message: "할 일을 찾을 수 없습니다" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    existing.task.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  const patch: { title?: string; status?: any } = {};

  if (data.title !== undefined) {
    if (data.title.trim() === "") {
      throw { status: 400, message: "잘못된 요청 형식" };
    }
    patch.title = data.title;
  }

  if (data.status !== undefined) {
    const statusMap: { [key: string]: string } = {
      todo: "TODO",
      in_progress: "IN_PROGRESS",
      done: "DONE",
    };

    patch.status = statusMap[data.status];
  }

  const updated = await taskRepo.updateSubTask(subTaskId, patch);
  return toSubTaskDto(updated);
};
export const getSubTask = async (
  userId: number,
  subTaskId: number,
): Promise<SubTaskDto> => {
  const subTask = await taskRepo.getSubTaskById(subTaskId);
  if (!subTask) {
    throw { status: 404, message: "할 일을 찾을 수 없습니다" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    subTask.task.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  return toSubTaskDto(subTask);
};

export const deleteSubTask = async (userId: number, subTaskId: number) => {
  const existing = await taskRepo.getSubTaskById(subTaskId);
  if (!existing) {
    throw { status: 404, message: "할 일을 찾을 수 없습니다" };
  }

  const isProjectMember = await projectRepo.isProjectMember(
    userId,
    existing.task.projectId,
  );
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  await taskRepo.deleteSubTask(subTaskId);
  return null;
};

export const createTaskWithAI = async (
  userId: number,
  projectId: number,
  naturalLanguage: string,
): Promise<TaskDto> => {
  const targetProject = await projectRepo.getProjectById(projectId);
  if (!targetProject) {
    throw { status: 400, message: "잘못된 요청 형식" };
  }
  const isProjectMember = await projectRepo.isProjectMember(userId, projectId);
  if (!isProjectMember) {
    throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  }

  const parsedInput = await parseNaturalLanguageToTask(naturalLanguage);

  if (!parsedInput.title || parsedInput.title.trim() === "") {
    throw { status: 400, message: "제목은 필수입니다" };
  }

  const startDate = new Date(
    parsedInput.startYear,
    parsedInput.startMonth - 1,
    parsedInput.startDay,
    parsedInput.startHour || 9,
    parsedInput.startMinute || 0,
  );
  const endDate = new Date(
    parsedInput.endYear,
    parsedInput.endMonth || parsedInput.startMonth,
    parsedInput.endDay || parsedInput.startDay,
    parsedInput.endHour || (parsedInput.startHour || 9) + 1,
    parsedInput.endMinute || parsedInput.startMinute || 0,
  );

  if (endDate < startDate) {
    throw { status: 400, message: "종료일이 시작일보다 빠를 수 없습니다" };
  }

  const createdTask = await taskRepo.createTask({
    title: parsedInput.title,
    description: parsedInput.description,
    projectId: projectId,
    assigneeId: userId,
    status: "todo",
    attachments: parsedInput.attachments || [],
    tags: parsedInput.tags || [],
    subTasks: parsedInput.subTasks || [],
    startDate: startDate,
    endDate: endDate,
  });

  if (startDate && endDate) {
    try {
      await googleCalendarService.createCalendarEvent(
        userId,
        createdTask.id,
        parsedInput.title,
        startDate,
        endDate,
        parsedInput.description || undefined,
      );
    } catch (error) {
      console.error("구글 캘린더 동기화 실패:", error);
    }
  }

  return CrudTaskApi(createdTask);
};
