import { body } from "express-validator"

export const eventOrganizerUpdateValidation = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ max: 36 }).withMessage("Username must not exceed 36 characters"),
    body("email")
        .isEmail().withMessage("Email must be valid")
        .isLength({ max: 255 }).withMessage("Email must not exceed 255 characters"),
    body("organizer_name")
        .notEmpty().withMessage("Organizer name is required")
        .isLength({ max: 125 }).withMessage("Organizer name must not exceed 125 characters"),
    body("phone_number")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ max: 16 }).withMessage("Phone number must not exceed 16 characters"),
    body("address")
        .optional()
        .isLength({ max: 255 }).withMessage("Address must not exceed 255 characters"),
]
