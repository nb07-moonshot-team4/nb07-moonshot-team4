const CrudTaskApi = (task : any) => {
  if (!task) return null;
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
    status: task.status,
    assignee: task.assignee ? {
      id : task.assignee.id,
      name: task.assignee.name,
      email: task.assignee.email,
      profileImage: task.assignee.profileImage ?? "",
    } : null,
    tags: task.tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name
    })),
    attachments: task.attachments,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
export default CrudTaskApi;