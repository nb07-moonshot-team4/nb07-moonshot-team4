import { Project } from "@prisma/client";
import prisma from "../utils/prisma";

export function createProject(data: Project) {
  return prisma.project.create({ data });
}