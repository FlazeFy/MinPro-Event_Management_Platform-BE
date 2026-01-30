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
