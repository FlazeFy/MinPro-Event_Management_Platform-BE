

import { body } from "express-validator";

export const createEventSchemaValidation = [
    body("event_title")
        .trim().notEmpty().withMessage("Event title is required")
        .isLength({ max: 144 }).withMessage("Event title must not exceed 144 characters"),
    body("event_desc")
        .trim().notEmpty().withMessage("Event description is required")
        .isLength({ max: 500 }).withMessage("Event description must not exceed 500 characters"),
    body("event_category")
        .notEmpty().withMessage("Event category is required")
        .isIn(["concert", "live_music", "theater"])
        .withMessage("Invalid event category"),
    body("event_price")
        .if(body("is_paid").equals("true"))
        .notEmpty().withMessage("Event price is required for paid events")
        .isInt({ min: 0 }).withMessage("Event price must be a positive number")
        .toInt(),
    body("maximum_seat")
        .notEmpty().withMessage("Maximum seat is required")
        .isInt({ min: 1 }).withMessage("Maximum seat must be at least 1")
        .toInt(),
    body("venue_id")
        .notEmpty().withMessage("Venue ID is required")
        .isUUID().withMessage("Venue ID must be valid UUID"),
    body("start_date")
        .notEmpty().withMessage("Start date is required")
        .isISO8601().withMessage("Start date must be valid ISO8601 date")
        .toDate(),
    body("end_date")
        .notEmpty().withMessage("End date is required")
        .isISO8601().withMessage("End date must be valid ISO8601 date")
        .toDate()
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_date)) throw new Error("End date must be after start date")
            return true
        }),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 144 })
        .withMessage("Schedule description must not exceed 144 characters"),
]