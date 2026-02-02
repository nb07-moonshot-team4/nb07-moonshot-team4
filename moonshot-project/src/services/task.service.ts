import CrudTaskApi from '../utils/taskMapper';
import * as taskRepo from '../repositories/task.repository';

interface CreateTaskDto {
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  status: 'todo' | 'in_progress' | 'done';
  tags: string[];
  attachments: string[];
}

export const createTask = async (userId: number, projectId: number, data: CreateTaskDto) => {
  // const isMember = await prisma.member.findFirst({
  //   where: {
  //     userId: userId,
  //     projectId: projectId,
  //   },
  // });

  // if (!isMember) {
  //   throw { status: 403, message: "프로젝트 멤버가 아닙니다" };
  // }

  const startDate = new Date(data.startYear, data.startMonth - 1, data.startDay);
  const endDate = new Date(data.endYear, data.endMonth - 1, data.endDay);

  
  if (endDate < startDate) {
    throw { status: 400, message: "종료일이 시작일보다 빠를 수 없습니다" };
  }

  const newTask = await taskRepo.createTask({
    title: data.title,
    projectId: projectId,
    assigneeId: userId,
    status: data.status,
    attachments: data.attachments,
    tags: data.tags,
    startDate: startDate,
    endDate: endDate,
  });
  return CrudTaskApi(newTask);

};

export const getTasksbyProjectId = async (projectId: number, offset: number, limit: number) => {
  const tasks = await taskRepo.getTasksByProjectId(projectId, {});
  const total = await taskRepo.countTasksByProjectId(projectId, {});

  return { data: tasks, total };
};