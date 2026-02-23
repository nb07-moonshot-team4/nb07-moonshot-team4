import { Response } from 'express';
import { AuthRequest } from './user-middleware.js';
import * as userService from './user-service.js';
import { UpdateMyInfoDto } from './user-dto.js';

export const getMyInfo = async (req: AuthRequest, res: Response) => {
    const user = await userService.getMyInfo(req.authUser!.id);
    return res.status(200).json(user);
};

export const UpdateMyInfo = async (req: AuthRequest, res: Response) => {
    const dto: UpdateMyInfoDto = req.body;
    const user = await userService.UpdateMyInfo(req.authUser!.id, dto);
    return res.status(200).json(user);
};

export const getMyProjects = async (req: AuthRequest, res: Response) => {
    const result = await userService.getMyProjects(req.authUser!.id, req.query);
    return res.status(200).json(result);
}

export const getMyTodos = async ( req: AuthRequest, res: Response ) => {
    const todos = await userService.getMyTodos(req.authUser!.id, req.query);
    return res.status(200).json(todos);
};