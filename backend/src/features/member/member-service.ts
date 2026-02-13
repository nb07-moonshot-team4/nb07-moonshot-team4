import { MemberRepo } from "./member-repository.js";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "../../error/errors.js";
import { MemberStatus } from "@prisma/client";
import type {
    ProjectMemberListItemDto,
    ProjectMemberListResponseDto,
    CreateInvitationResponseDto,
    ProjectMemberStatusDto,
} from "./member-dto.js";

export class MemberService {
    private repo = new MemberRepo();

    private toApiStatus(status: MemberStatus): ProjectMemberStatusDto {
        switch (status) {
            case "INVITED": return "pending";
            case "ACTIVE": return "accepted";
            case "REJECTED": return "rejected";
            case "LEFT": return "rejected";
        }
    }

    private parsePaging(pageRaw?: string, limitRaw?: string) {
        const page = Math.max(1, Number(pageRaw ?? 1) || 1);
        const limit = Math.min(50, Math.max(1, Number(limitRaw ?? 20) || 20));
        const skip = (page - 1) * limit;
        return { limit, skip };
    }

    private async requireProject(projectId: number) {
        const project = await this.repo.findProject(projectId);
        if (!project) throw new NotFoundError("잘못된 요청 형식");
        return project;
    }

    private async requireActiveMember(projectId: number, actorId: number) {
        const actor = await this.repo.findActiveMember(projectId, actorId);
        if (!actor) throw new ForbiddenError("프로젝트 멤버가 아닙니다");
        return actor;
    }

    private async requireOwner(projectId: number, actorId: number) {
        const actor = await this.requireActiveMember(projectId, actorId);
        if (actor.role !== "OWNER") throw new ForbiddenError("권한이 없습니다.");
        return actor;
    }
    private toListItemDto(
        m: {
            userId: number;
            status: MemberStatus;
            invitationId: string | null;
            user: { id: number; name: string; email: string; profileImage: string | null };
        },
        taskCount: number
    ): ProjectMemberListItemDto {
        return {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            profileImage: m.user.profileImage ?? null,
            taskCount,
            status: this.toApiStatus(m.status),
            invitationId: m.invitationId ?? null,
        };
    }

    // GET /projects/:projectId/users
    async listMembers(actorId: number, projectId: number, pageRaw?: string, limitRaw?: string): Promise<ProjectMemberListResponseDto> {
        await this.requireProject(projectId);
        await this.requireActiveMember(projectId, actorId);

        const { limit, skip } = this.parsePaging(pageRaw, limitRaw);
        const { total, rows } = await this.repo.findMembersPaged(projectId, skip, limit);

        const userIds = rows.map((r) => r.userId);
        const taskCountMap = await this.repo.countTasksByAssignee(projectId, userIds);

        const data = rows.map((m) =>
            this.toListItemDto(m as any, taskCountMap.get(m.userId) ?? 0)
        );

        return { data, total };
    }

    // DELETE /projects/:projectId/users/:userId
    async deleteMember(actorId: number, projectId: number, targetUserId: number) {
        await this.requireProject(projectId);
        await this.requireOwner(projectId, actorId);
        const target = await this.repo.findMember(projectId, targetUserId);
        if (!target) throw new NotFoundError("멤버를 찾을 수 없습니다");
        await this.repo.markMemberLeft(projectId, targetUserId);
    }

    // POST /projects/:projectId/invitations
    async createInvitation(actorId: number, projectId: number, email: string): Promise<CreateInvitationResponseDto> {
        await this.requireProject(projectId);

        const actor = await this.requireActiveMember(projectId, actorId);
        const canInvite = actor.role === "OWNER" || actor.role === "ADMIN";
        if (!canInvite) throw new ForbiddenError("프로젝트 관리자가 아닙니다");

        const invitedUser = await this.repo.findUserByEmail(email);
        if (!invitedUser) {
            throw new BadRequestError("잘못된 요청 형식");
        }

        const invitationId = await this.repo.upsertInvitationMember(projectId, invitedUser.id);
        return { invitationId };
    }

    // POST /invitations/:invitationId/accept
    async acceptInvitation(actorId: number, invitationId: string): Promise<void> {
        const invited = await this.repo.findMemberByInvitationId(invitationId);
        if (!invited || invited.status !== MemberStatus.INVITED) {
            throw new NotFoundError("유효하지 않은 초대입니다");
        }
        await this.repo.acceptInvitation(invitationId);
    }

    // DELETE /invitations/:invitationId
    async deleteInvitation(actorId: number, invitationId: string): Promise<void> {
        const invited = await this.repo.findMemberByInvitationId(invitationId);
        if (!invited || invited.status !== MemberStatus.INVITED) {
            throw new NotFoundError;
        }
        await this.requireOwner(invited.projectId, actorId);
        await this.repo.cancelInvitation(invitationId);
    }
}