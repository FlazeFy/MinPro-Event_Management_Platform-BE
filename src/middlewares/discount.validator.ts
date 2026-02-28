import { body } from "express-validator"

export const discountSchemaValidation = [
    body("percentage").notEmpty().withMessage("Percentage is required")
        .isInt({ min: 1, max: 100 }).withMessage("Percentage must be an integer between 1 and 100"),
    body("description").notEmpty().withMessage("Description is required")
        .isLength({ max: 144 }).withMessage("Description must not exceed than 144 characters")
]

export const discountUpdateSchemaValidation = [
    body("description").notEmpty().withMessage("Description is required")
        .isLength({ max: 144 }).withMessage("Description must not exceed than 144 characters")
]