import { validationResult } from "express-validator"
import { NextFunction, Request, Response } from "express"

export const validationCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw { code: 400, message: errors.array() }
        next()
    } catch (error) {
        next(error)
    }
}