import { validationResult } from "express-validator"
import { NextFunction, Request, Response } from "express"
import { eventOrganizerUpdateValidation } from "./event_organizer.validator"
import { customerUpdateValidation } from "./customer.validator"

export const validationCheck = (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw { code: 400, message: errors.array() }
        next()
    } catch (error) {
        next(error)
    }
}

export const validationCheckForProfileUpdate = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.decript as { id: number; role: string }

    let validators
    switch (user.role) {
        case "event_organizer":
            validators = eventOrganizerUpdateValidation
            break;
        case "customer":
            validators = customerUpdateValidation
            break;
        default:
            return next({ code: 409, message: "Role not valid" })
    }

    Promise.all(validators.map(v => v.run(req))).then(() => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return next({ code: 400, message: errors.array() })
        next()
    })
}

type ParamRule = {
    required?: boolean
    min?: number
    max?: number
    alloweds?: string[]
}
  
export type ParamValidatorSchema = Record<string, ParamRule>

export const validateParamMiddleware = (schema: ParamValidatorSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: Record<string, string> = {}

        for (const param in schema) {
            const rules = schema[param]
            const value = req.params[param]

            if (rules.required && !value) {
                errors[param] = `${param} is required`
                continue
            }

            if (!value) continue

            if (typeof value === "string") {
                if (rules.min && value.length < rules.min) {
                    errors[param] = `${param} must be at least ${rules.min} characters`
                }
                if (rules.max && value.length > rules.max) {
                    errors[param] = `${param} must be at most ${rules.max} characters`
                }
                if (rules.alloweds && !rules.alloweds.includes(value)) {
                    errors[param] = `${param} must be one of: ${rules.alloweds.join(", ")}`
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                message: "Validation error",
                data: errors
            })
        }

        next()
    }
}