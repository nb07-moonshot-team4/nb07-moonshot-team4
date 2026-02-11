import { NextFunction, Response } from "express";
import { AuthRequest } from "../user/user-middleware.js"
import * as projectService from "./project-service.js"

export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.authUser!.id;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "잘못된 데이터 형식",
      });
    }

    const project = await projectService.createProject(userId, {
      name,
      description,
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try{
        const project = await projectService.getProjectById(Number(req.params.projectId));
        res.status(200).json(project);
    } catch(err) {
        next(err);
    }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await projectService.updateProject(
      Number(req.params.projectId),
      req.body
    );

    res.status(200).json(project);

  } catch (err: any) {

    if (err.status === 400) {
      return res.status(400).json({ message: err.message });
    }

    next(err); 
  }
};

export const deleteProject = async (req:AuthRequest, res:Response, next:NextFunction) => {
    try{
        await projectService.deleteProject(Number(req.params.projectId))
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};