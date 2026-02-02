

interface CreateTodo { 
  id: number;
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  status: "todo" | "in-progress" | "done";
  tag : string [];
  attachments: string[];
}

interface ResponseTodo {
  id: number;
  projectId: number;
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  assignee: { id : number; name: string; email: string; profileImage: string | null } | null;
  tags : { id : number; name: string }[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

interface getTodolistByProjectId {
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
			updatedAt: Date,    
},
...CreateTodo[] 
 ],
total : number;
}


interface getTodolist {
  data : [
    {
      id: number;
      projectId: number;
      title: string;
      startYear: number;
      startMonth: number;
      startDay: number;
      endYear: number;
      endMonth: number;
      endDay: number;
      status : "todo" | "in-progress" | "done";
      assignee: { id : number; name: string; email: string; profileImage: string | null } | null;
      tags : { id : number; name: string }[];
      attachments: string[];
      createdAt: string;
      updatedAt: string;
    },
    ...CreateTodo[]
  
  ],
  total : number;
}


interface UpdateTodo {

	title: string,
  startYear: number,
	startMonth: number,
	startDay: number,
	endYear: number,
	endMonth: number,
	endDay: number,
	status: "todo" | "in_progress" | "done",
	assigneeId: number,
	tags: string[]
	attachments: string []
}


interface DeleteTodo {
  id : number;
  projectId : number;
  title : string;
}

