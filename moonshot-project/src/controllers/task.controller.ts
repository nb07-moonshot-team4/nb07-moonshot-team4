import { Request, Response } from 'express';
import * as taskService from '../services/task.service';

export const createTask = async (req: Request, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }
    const userId = req.user.id;


    const projectId = Number(req.params.projectId);
    const {
      title,
      startYear,
      startMonth,
      startDay,
      endYear,
      endMonth,
      endDay,
      status,
      tags,
      attachments
    }: {
      title: string,
      startYear: number,
      startMonth: number,
      startDay: number,
      endYear: number,
      endMonth: number,
      endDay: number,
      status: "todo" | "in_progress" | "done",
      tags: string[],
      attachments: string []
    } = req.body;

 
    const result = await taskService.createTask(userId, projectId, {
      title,
      startYear,
      startMonth,
      startDay,
      endYear,
      endMonth,
      endDay,
      status,
      tags,
      attachments
    });

    res.status(200).json(result);

  } catch (error: any) {
    console.error(error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

 
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
};

export async function getTasksByProjectId(req: Request, res: Response) {}