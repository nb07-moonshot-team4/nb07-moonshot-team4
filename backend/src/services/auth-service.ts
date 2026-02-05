import { Prisma } from "@prisma/client";
import { hashedPassword } from "../utils/hash.js";

export const register = async (
    email: string,
    name: string,
    password: string,
    passwordconfirm: string
) => {
    if (password !== passwordconfirm) {
        throw { status:400, message: "잘못된 요청입니다." };
    }

    const exists = await Prisma.user.findUnique({ where: { email }});
    if (exists) {
        throw { status:400, message: "이미 가입한 이메일입니다."}
    }

    const user = await Prisma.user.create({
        data: { email, name },
    });

    await Prisma.userAuthProvider.create({
        data: {
            userId: user.id,
            provider: "LOCAL",
            providerUserId: email,
            passwordHash: await hashedPassword(password),
        },
    });

    return user;
}