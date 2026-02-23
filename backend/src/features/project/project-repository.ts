import { Project } from "@prisma/client";
import prisma from "../../shared/utils/prisma.js";

export function createProject(data: Project) {
  return prisma.project.create({ data });
}

export function getProjectById(projectId: number): Promise<Project | null> {
  return prisma.project.findUnique({
    where: { id: projectId },
  });
}

export async function isProjectMember(userId: number, projectId: number): Promise<boolean> {
  const project = await getProjectById(projectId);
  if (!project) {
    return false;
  }
  
  const member = await prisma.projectMember.findFirst({
    where: {
      userId: userId,
      projectId: projectId,
    },
  });

  if (member) {
    return true;
  }
  
  const task = await prisma.task.findFirst({
    where: {
      projectId: projectId,
      assigneeId: userId,
    },
  });
  
  return !!task;
}
