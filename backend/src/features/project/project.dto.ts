export interface createProjectDto {
	title: string,
	startYear: number,
	startMonth: number,
	startDay: number,
	endYear: number,
	endMonth: number,
	endDay: number,
	status: "todo" | "in_progress" | "done",
	tags: string[]
	attachments: string []
}

export interface  getTodolistByProjectIdDto {
  data : [
    {
      id: number,
      projectId: number,
      title: string,
      startYear: number,
      startMonth: number,
      startDay: number,
      endYear: number,
      endMonth: number,
      endDay: number,
      status: "todo" | "in_progress" | "done",
      assignee: { id: number, name: string, email: string, profileImage: string } | null,
      tags: { id: number, name: string }[],
      attachments: string[],
      createdAt: Date,
      updatedAt: Date
    },
    ...createProjectDto[]
  ],
  total : number;
}
