import { Request, Response } from "express";
import * as taskService from "./task-service.js";
import {
  CreateSubTaskDto,
  CreateTaskDto,
  UpdateSubTaskDto,
  UpdateTaskDto,
} from "./task-dto.js";

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const projectId = Number(req.params.projectId);
    const createTaskDto: CreateTaskDto = req.body;

    const result = await taskService.createTask(
      userId,
      projectId,
      createTaskDto,
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
};

export async function getTasksByProjectId(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const projectId = Number(req.params.projectId);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const taskStatus = req.query.status as
      | "todo"
      | "in_progress"
      | "done"
      | undefined;
    const assigneeId = req.query.assignee
      ? Number(req.query.assignee)
      : undefined;
    const keyword = req.query.keyword as string | undefined;
    const sortOrder = req.query.order as "asc" | "desc" | undefined;
    const sortField = req.query.order_by as
      | "created_at"
      | "name"
      | "end_date"
      | undefined;

    const result = await taskService.getTasksByProjectId(
      userId,
      projectId,
      page,
      limit,
      {
        status: taskStatus,
        assigneeId,
        keyword,
        order: sortOrder,
        orderBy: sortField,
      },
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const taskId = Number(req.params.taskId);
    const result = await taskService.getTask(userId, taskId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const taskId = Number(req.params.taskId);
    const updateTaskDto: UpdateTaskDto = req.body;

    const result = await taskService.updateTask(taskId, userId, updateTaskDto);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const taskId = Number(req.params.taskId);
    const result = await taskService.deleteTask(taskId, userId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export async function createSubTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const taskId = Number(req.params.taskId);
    const createSubTaskDto: CreateSubTaskDto = req.body;

    const result = await taskService.createSubTask(
      userId,
      taskId,
      createSubTaskDto,
    );
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}
export async function getSubTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const subTaskId = Number(req.params.subTaskId);
    const result = await taskService.getSubTask(userId, subTaskId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}
export async function updateSubTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const subTaskId = Number(req.params.subTaskId);
    const updateSubTaskDto: UpdateSubTaskDto = req.body;

    const result = await taskService.updateSubTask(
      userId,
      subTaskId,
      updateSubTaskDto,
    );
    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export async function deleteSubTask(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const subTaskId = Number(req.params.subTaskId);
    const result = await taskService.deleteSubTask(userId, subTaskId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}
