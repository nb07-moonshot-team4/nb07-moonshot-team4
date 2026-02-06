import { TaskDto } from "./task-dto.js";

function toApiTaskStatus(status: any): TaskDto["status"] {
  const v = String(status).toUpperCase();
  if (v === "TODO") return "todo";
  if (v === "IN_PROGRESS") return "in_progress";
  if (v === "DONE") return "done";
  return "todo";
}

function toApiSubTaskStatus(status: any): 'todo' | 'done' {
  const v = String(status).toUpperCase();
  if (v === "DONE") return "done";
  return "todo";
}

const CrudTaskApi = (task : any): TaskDto => {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    startYear: task.startDate.getFullYear(),
    startMonth: task.startDate.getMonth() + 1,
    startDay: task.startDate.getDate(),

    endYear: task.endDate.getFullYear(),
    endMonth: task.endDate.getMonth() + 1,
    endDay: task.endDate.getDate(),
    status: toApiTaskStatus(task.status),
    assignee: task.assignee ? {
      id : task.assignee.id,
      name: task.assignee.name,
      email: task.assignee.email,
      profileImage: task.assignee.profileImage ?? "",
    } : null,
    tags: task.tags.map((taskTag: any) => ({
      id: taskTag.tag.id,
      name: taskTag.tag.name
    })),
    attachments: task.attachments.map((a: any) => a.url),
    subTasks: task.subTasks?.map((st: any) => ({
      id: st.id,
      title: st.title,
      status: toApiSubTaskStatus(st.status),
    })),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
export default CrudTaskApi;
