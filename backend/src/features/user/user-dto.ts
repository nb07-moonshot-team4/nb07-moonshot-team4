export interface UpdateMyInfoDto {
    email?: string;
    name?: string;
    currentPassword?: string;
    newPassword?: string;
    profileImage?: string | null;
}