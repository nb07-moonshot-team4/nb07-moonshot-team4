import { Request, Response, NextFunction, RequestHandler } from 'express';

export const withAsync = (handler: any): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};