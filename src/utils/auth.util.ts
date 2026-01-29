import { genSalt, hash } from "bcrypt"
import jwt from "jsonwebtoken"

interface JwtPayload {
    id: string
    role?: string
}

export const hashPassword = async (password: string) => {
    const salt = await genSalt(10)

    return await hash(password, salt)
}

export const extractUserFromAuthHeader = (authHeader?: string) => {
    if (!authHeader) throw new Error("Authorization header missing")

    const token = authHeader.split(" ")[1]
    if (!token) throw new Error("Token missing")

    const decoded = jwt.verify(token,process.env.SECRET || "secret")
    if (typeof decoded === "string" || !("id" in decoded)) throw new Error("Invalid token payload")

    const payload = decoded as JwtPayload
    return {
        userId: payload.id,
        role: payload.role ?? null,
    }
}