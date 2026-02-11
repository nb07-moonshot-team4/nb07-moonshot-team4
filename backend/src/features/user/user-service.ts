import prisma from "../../shared/utils/prisma.js";
import { UpdateMyInfoDto } from "./user-dto.js";
import bcrypt from 'bcrypt';

export const getMyInfo = async (userId: number) => {
    const getInfo = await prisma.user.findUnique({
        where: {id: userId}
    });

    if (!getInfo) {
        throw new Error('존재하지 않는 유저입니다.');
    }
    return getInfo
};

export const UpdateMyInfo = async (
    userId: number,
    dto: UpdateMyInfoDto
) => {
    const {
        email,
        name,
        profileImage
    } = dto;
    if (
        (dto.currentPassword && !dto.newPassword) ||
        (!dto.currentPassword && dto.newPassword)
    ) {
        throw new Error('잘못된 데이터 형식');
    }
    if( dto.currentPassword && dto.newPassword) {
        const provider = await prisma.userAuthProvider.findFirst({
            where: { userId, provider: 'local'}
        });

        if (!provider?.passwordHash) {
            throw new Error('비밀번호 없음');
        }

        const isMatch = await bcrypt.compare(
            dto.currentPassword,
            provider.passwordHash
        );

        if(!isMatch) {
            throw new Error('현재 비밀번호 불일치');
        }

        const newHash = await bcrypt.hash(dto.newPassword, 10);

        await prisma.userAuthProvider.update({
            where: { id: provider.id },
            data: { passwordHash: newHash }
        });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(email && { email }),
            ...(name && { name }),
            ...(profileImage !== undefined && { profileImage })
        }
    });
    return updatedUser;
};

export const getMyProjects = async (
    userId: number,
    query: any
) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
        prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId,
                        status: 'ACTIVE'
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        }),
        prisma.project.count({
            where: {
                members: {
                    some: {
                        userId,
                        status: 'ACTIVE'
                    }
                }
            }
        })
    ]);

    return {
        data,
        total
    };
};

export const getMyTodos = async (
    userId: number,
    query: any
) => {
    const {
        status,
        assignee_id,
        from,
        to,
        project_id,
        keyword
    } = query;

    return prisma.task.findMany({
        where: {
            project: {
                members: {
                    some: {
                        userId,
                        status: 'ACTIVE'
                    }
                }
            },
            ...(project_id && {
                projectId: Number(project_id)
            }),

            ...(status && {
                status
            }),

            ...(assignee_id && {
                assigneeId: Number(assignee_id)
            }),
            ...(from && to && {
                createdAt: {
                    gte: new Date(from),
                    lte: new Date(to)
                }
            }),
            ...(keyword && {
                title: {
                    contains: keyword,
                    mode: 'insensitive'
                }
            })
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};