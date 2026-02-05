import { Prisma } from "@prisma/client"
import { comparePassword, hashedPassword } from "../utils/hash.js";

export const getMe = async (userId: number) => {
    const user = await Prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        throw { status:404, message:"존재하는 않는 유저입니다." };
    }

    return user;
}

export const updateMe = async (
    userId: number,
    body: {
        email?: string;
        name?: string;
        currentPassword?: string;
        newPassword?: string;
        profileImage?: string | null;
    }
) => {
    const user = await Prisma.user.findUnique({ where: { id: userId }});
    if(!user) {
        throw { status: 404, message: "존재하지 않는 유저입니다."};
    }

    if(body.newPassword){
        if(!body.currentPassword){
            throw { status: 400, message: "잘못된 데이터 형식"};
        }

        const auth = await Prisma.userAuthProvider.findFirst({
            where: { userId, provider: "LOCAL"},
        });

        if(!auth?.passwordHash) {
            throw { status: 401, message: "로그인이 필요합니다"};
        }

        const valid = await comparePassword(
            body.currentPassword,
            auth.passwordHash
        );

        if(!valid) {
            throw { status: 401, message: "로그인이 필요합니다"};
        }

        await Prisma.userAuthProvider.update({
            where: { id: auth.id },
            data: {
                passwordHash: await hashedPassword(body.newPassword),
            },
        });
    }

    return Prisma.user.update({
        where: { id: userId },
        data: {
            email: body.email,
            name: body.name,
            profileImage: body.profileImage,
        },
    });
};

export const getMyProjects = async (
   userId: number,
   page: number,
   limit: number,
   order: "asc" | "desc",
   orderBy: "created_at" | "name"
) => {
    const skip = (page - 1) * limit;

    const [ data, total ] = await Promise.all([
        Prisma.Project.findMany({
            where: {
                members: {
                    some: {userId, status: "ACTIVE"},
                },
            },
            orderBy: {
                [orderBy === "created_at" ? "createdAt" : "name"]: order,
            },
            skip,
            take: limit,
        }),
        Prisma.Project.count({
            where: {
                members: {
                    some: { userId, status: "ACTIVE"},
                },
            },
        }),
    ]);

    return { data, total };
}

export const getMyTasks = async (userId: number, query) => {
    const where: any = {
        project: {
            members: {
                some: { userId },
            },
        },
    };

    if (query.project_id) where.projectId = Number(query.project_id);
    if (query.status) where.status = query.status;
    if (query.assignee_id) where.assigneeId = Number(query.assignee_id);
    if (query.keyword)
        where.title = { contains: query.keyword };

    if ( query.from && query.to) {
        where.createdAt = {
            gte: new Date(query.from),
            lte: new Date(query.to),
        };
    }

    return Prisma.task.findMany({
        where,
        include: {
            assignee: true,
            tags: { include: { tag: true } },
            attachments: true,
        },
    });
};