import { body } from "express-validator"

export const transactionSchemaValidation = [
    body("payment_method")
        .notEmpty().withMessage("Payment method is required")
        .isIn(["bank_transfer", "virtual_account", "e-payment", "free"])
        .withMessage("Payment method must be 'bank transfer', 'virtual account', or 'e-payment'"),
    body("event_id")
        .notEmpty().withMessage("Event ID is required")
        .isLength({ min: 36, max: 36 }).withMessage("Event ID must be 36 characters"),
    body("discount_id")
        .optional({ nullable: true })
        .isLength({ min: 36, max: 36 }).withMessage("Discount ID must be 36 characters"),
    body("attendees")
        .notEmpty().withMessage("Attendee is required")
        .isArray({ min: 1 }).withMessage("Attendee must be an array and contain at least 1 item"),
    body("attendees.*.fullname")
        .notEmpty().withMessage("Full name is required")
        .isLength({ max: 36 }).withMessage("Full name must not exceed 36 characters"),
    body("attendees.*.birth_date")
        .notEmpty().withMessage("Birth date is required")
        .isISO8601().withMessage("Birth date must be a valid ISO8601 date"),
    body("attendees.*.phone_number")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ max: 16 }).withMessage("Phone number must not exceed 16 characters"),
]