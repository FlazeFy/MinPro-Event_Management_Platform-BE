import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) throw { code: 401, message: "Token not exist" }

        const decript = jwt.verify(token, process.env.SECRET || "secret")
        res.locals.decript = decript

        next()
    } catch (error) {
        next(error)
    }
}

export const authorizeRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = res.locals.decript as { id: number; role: string };

            if (!user) throw { code: 401, message: "Unauthorized" }
            if (!roles.includes(user.role)) throw { code: 403, message: "Your role is not authorized" }

            next()
        } catch (error) {
            next(error)
        }
    }
}