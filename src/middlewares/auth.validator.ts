import { body, validationResult } from "express-validator"
import { NextFunction, Request, Response } from "express"

export const loginSchemaValidation = [
    body("email").notEmpty().isEmail().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required").isStrongPassword({
        minLength:6,
        minLowercase:0,
        minUppercase:0,
        minNumbers:0,
        minSymbols:0
    })
]

export const validationCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw { code: 400, message: errors.array() }
        next()
    } catch (error) {
        next(error)
    }
}