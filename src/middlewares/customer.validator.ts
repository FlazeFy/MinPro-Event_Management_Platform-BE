import { body } from "express-validator"

export const customerUpdateValidation = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ max: 36 }).withMessage("Username must not exceed 36 characters"),
    body("email")
        .isEmail().withMessage("Email must be valid")
        .isLength({ max: 255 }).withMessage("Email must not exceed 255 characters"),
    body("fullname")
        .notEmpty().withMessage("Fullname is required")
        .isLength({ max: 75 }).withMessage("Fullname must not exceed 75 characters"),
    body("phone_number")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ max: 16 }).withMessage("Phone number must not exceed 16 characters"),
    body("birth_date")
        .isISO8601().withMessage("Birth date must be a valid ISO8601 date"),
]
  