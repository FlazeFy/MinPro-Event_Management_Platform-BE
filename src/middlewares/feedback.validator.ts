import { body } from "express-validator"

export const feedbackSchemaValidation = [
    body("feedback_rate").notEmpty().withMessage("Feedback rate is required")
        .isInt({ min: 1, max: 5 }).withMessage("Feedback rate must be an integer between 1 and 5"),
    body("feedback_body").notEmpty().withMessage("Feedback body is required")
        .isLength({ max: 255 }).withMessage("Feedback body must not exceed than 255 characters")
]