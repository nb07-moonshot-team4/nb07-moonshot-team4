import { MemberRepo } from "./member-repository.js";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
} from "../error/errors.js";
import { MemberStatus } from "@prisma/client";

export class MemberService {
    private repo = new MemberRepo();

    private toApiStatus(status: MemberStatus): "pending" | "accepted" | "rejected" {
        switch (status) {
            case "INVITED": return "pending";
            case "ACTIVE": return "accepted";
            case "REJECTED": return "rejected";
            default: return "rejected";
        }
    }

    private parsePaging(pageRaw?: string, limitRaw?: string) {
        const page = Math.max(1, Number(pageRaw ?? 1) || 1);
        const limit = Math.min(50, Math.max(1, Number(limitRaw ?? 20) || 20));
        const skip = (page - 1) * limit;
        return { limit, skip };
    }

    // GET members
    async listMembers(actorId: number, projectId: number, pageRaw?: string, limitRaw?: string) {
        const project = await this.repo.findProject(projectId);
        if (!project) throw new NotFoundError("프로젝트가 없습니다");

        const isMember = await this.repo.isActiveMember(projectId, actorId);
        if (!isMember) throw new ForbiddenError("프로젝트 멤버가 아닙니다");

        const { limit, skip } = this.parsePaging(pageRaw, limitRaw);
        const { total, rows } = await this.repo.findMembersPaged(projectId, skip, limit);

        const userIds = rows.map((r) => r.userId);
        const taskCountMap = await this.repo.countTasksByAssignee(projectId, userIds);

        const data = rows.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            profileImage: m.user.profileImage ?? null,
            taskCount: taskCountMap.get(m.userId) ?? 0,
            status: this.toApiStatus(m.status),
            invitationId: m.invitationId ?? null,
        }));

        return { data, total };
    }

    // DELETE member 
    async deleteMember(actorId: number, projectId: number, targetUserId: number) {
        const project = await this.repo.findProject(projectId);
        if (!project) throw new NotFoundError("프로젝트를 찾을 수 없습니다");

        const isMember = await this.repo.isActiveMember(projectId, actorId);
        if (!isMember) throw new ForbiddenError("프로젝트 관리자가 아닙니다");

        const target = await this.repo.findMember(projectId, targetUserId);
        if (!target) throw new NotFoundError("멤버를 찾을 수 없습니다");

        await this.repo.markMemberLeft(projectId, targetUserId);
    }

    // POST invitation 
    async createInvitation(actorId: number, projectId: number, email: string) {
        const project = await this.repo.findProject(projectId);
        if (!project) throw new NotFoundError("프로젝트를 찾을 수 없습니다");

        const actor = await this.repo.findActiveMember(projectId, actorId);
        if (!actor) throw new ForbiddenError("프로젝트 관리자가 아닙니다");

        const canInvite = actor.role === "OWNER" || actor.role === "ADMIN";
        if (!canInvite) throw new ForbiddenError("프로젝트 관리자가 아닙니다");

        const invitedUser = await this.repo.findUserByEmail(email);
        if (!invitedUser) {
            throw new BadRequestError("잘못된 요청 형식");
        }

        const invitationId = await this.repo.upsertInvitationMember(projectId, invitedUser.id);
        return { invitationId };
    }

    //POST 멤버초대수락 
    async acceptInvitation(actorId: number, invitationId: string) {
        const invited = await this.repo.findMemberByInvitationId(invitationId);
        if (!invited) {
            throw new NotFoundError("초대를 찾을 수 없습니다");
        }
        await this.repo.acceptInvitation(invitationId);
    }
    //DELETE 멤버초대삭제
    async deleteInvitation(actorId: number, invitationId: string) {
        const invited = await this.repo.findMemberByInvitationId(invitationId);
        if (!invited || invited.status !== MemberStatus.INVITED) {
            throw new NotFoundError("초대를 찾을 수 없습니다", "INVITATION_NOT_FOUND");
        }

        // 여기서 actor 권한(ADMIN/OWNER) 체크는 기존 로직 그대로
        // const actor = await this.repo.findActiveMember(invited.projectId, actorId);
        // if (!actor || !["ADMIN","OWNER"].includes(actor.role)) throw new ForbiddenError(...);

        await this.repo.cancelInvitation(invitationId);
    }
}

