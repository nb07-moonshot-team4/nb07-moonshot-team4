export interface TaskDto {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  status: 'todo' | 'in_progress' | 'done';
  assignee: { id: number; name: string; email: string; profileImage: string } | null;
  tags: { id: number; name: string }[];
  attachments: string[];
  subTasks?: { id: number; title: string; status: 'todo' | 'in_progress' | 'done' }[];
  createdAt: Date;
  updatedAt: Date;
}


export function mapSubTaskStatusToDto(status: any): SubTaskDto["status"] {
  const v = String(status).toUpperCase();
  if (v === "DONE") return "done";
  if (v === "IN_PROGRESS") return "in_progress";
  return "todo";
}

export function toSubTaskDto(subTask: any): SubTaskDto {
  return {
    id: subTask.id,
    taskId: subTask.taskId,
    title: subTask.title,
    status: mapSubTaskStatusToDto(subTask.status),
    createdAt: subTask.createdAt,
    updatedAt: subTask.updatedAt,
  };
}

export interface SubTaskDto {
  id: number;
  taskId: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubTaskDto {
  title: string;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  status?: 'todo' | 'in_progress' | 'done';
  tags?: string[];
  attachments?: string[];
}

export interface UpdateSubTaskDto {
  title?: string;
  status?: 'todo' | 'in_progress' | 'done';
}

export interface GetSubTasksResponseDto {
  data: SubTaskDto[];
  total: number;
}

export interface GetTasksResponseDto {
  data: TaskDto[];
  total: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  status?: 'todo' | 'in_progress' | 'done';
  tags: string[];
  attachments: string[];
  subTasks?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  status?: 'todo' | 'in_progress' | 'done';
  tags?: string[];
  attachments?: string[];
  subTasks?: string[];
  assigneeId?: number | null;
}
