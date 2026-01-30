import { body } from "express-validator"

export const loginSchemaValidation = [
    body("email").notEmpty().isEmail().withMessage("Email is required")
        .isLength({ max: 255 }).withMessage("Email must not exceed than 255 characters")
        .isLength({ min: 10 }).withMessage("Email must not less than 10 characters"),
    body("password").notEmpty().withMessage("Password is required").isStrongPassword({
        minLength:6,
        minLowercase:0,
        minUppercase:0,
        minNumbers:0,
        minSymbols:0
    })
]

