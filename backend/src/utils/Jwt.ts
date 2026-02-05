import jwt from "jsonwebtoken";

export const signAccessToken = (userId: number) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );
};