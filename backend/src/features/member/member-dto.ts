export type ProjectMemberStatusDto = "pending" | "accepted" | "rejected";

export interface ProjectMemberListItemDto {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
    taskCount: number;
    status: ProjectMemberStatusDto;
    invitationId: string | null;
}

export interface ProjectMemberListResponseDto {
    data: ProjectMemberListItemDto[];
    total: number;
}

export interface CreateInvitationResponseDto {
    invitationId: string;
}