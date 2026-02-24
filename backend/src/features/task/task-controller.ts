import { Request, Response } from "express";
import * as taskService from "./task-service.js";
import {
  CreateSubTaskDto,
  CreateTaskDto,
  UpdateSubTaskDto,
  UpdateTaskDto,
} from "./task-dto.js";
import prisma from "../../shared/utils/prisma.js";

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
    await taskService.deleteTask(taskId, userId);

    res.status(204).send();
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

export async function getSubTasksByTaskId(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const taskId = Number(req.params.taskId);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "유효하지 않은 할 일 입니다" });
    }

    const result = await taskService.getSubTasksByTaskId(userId, taskId);

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
    await taskService.deleteSubTask(userId, subTaskId);

    res.status(204).send();
  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}

export const createTaskWithAI = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;

    const projectId = Number(req.params.projectId);
    const { naturalLanguage } = req.body;

    if (
      !naturalLanguage ||
      typeof naturalLanguage !== "string" ||
      naturalLanguage.trim() === ""
    ) {
      return res.status(400).json({
        message: "자연어 입력이 필요합니다. 예: '내일모레 점심에 회의'",
      });
    }

    const result = await taskService.createTaskWithAI(
      userId,
      projectId,
      naturalLanguage.trim(),
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("AI 태스크 생성 오류:", error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    res.status(500).json({
      message: "서버 내부 오류가 발생했습니다.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getDashboardTasks = async (req: Request, res: Response) => {
  const { project_id, assignee_id, keyword, status } = req.query;

  try {
    const where: any = {};

    if (project_id) {
      where.projectId = Number(project_id);
    }

    if (assignee_id && assignee_id !== "all") {
      where.assigneeId = Number(assignee_id);
    }

    if (keyword) {
      where.title = {
        contains: String(keyword),
        mode: "insensitive",
      };
    }

    if (status && status !== "all") {
      where.status = String(status).toUpperCase() as any;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, profileImage: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "대시보드 조회 실패", error });
  }
};

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }

    if (req.file === undefined && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
      return res.status(400).json({ message: "파일이 필요합니다" });
    }


    const files = Array.isArray(req.files) ? req.files : [req.files];
    const imageUrls = files.map((file: any) => file.secure_url || file.url).filter(Boolean);

    if (imageUrls.length === 0) {
      return res.status(500).json({ message: "이미지 URL을 가져올 수 없습니다" });
    }

    res.status(200).json(imageUrls);
  } catch (error: any) {
    console.error("파일 업로드 오류:", error);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "파일 크기는 5MB를 초과할 수 없습니다" });
    }
    
    if (error.message && error.message.includes('이미지 파일만 업로드 할 수 있습니다.')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({
      message: "파일 업로드 중 오류가 발생했습니다.",
      error: process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
};