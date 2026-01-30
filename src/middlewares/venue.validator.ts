import { body } from "express-validator"

export const venueSchemaValidation = [
    body("venue_name").notEmpty().withMessage("Venue name is required")
        .isLength({ max: 74 }).withMessage("Venue name must not exceed than 74 characters"),
    body("venue_description").notEmpty().withMessage("Venue description is required")
        .isLength({ max: 255 }).withMessage("Venue description must not exceed than 255 characters"),
    body("venue_address").notEmpty().withMessage("Venue address is required")
        .isLength({ max: 500 }).withMessage("Venue address must not exceed than 500 characters"),
    body("venue_coordinate").notEmpty().withMessage("Venue coordinate is required")
        .isLength({ max: 144 }).withMessage("Venue coordinate must not exceed than 144 characters")
        .custom((value) => {
            const parts = value.split(",")
            if (parts.length !== 2) throw { code: 400, message: "Venue coordinate must be in 'lat,lng' format" }
      
            const lat = parseFloat(parts[0])
            const lng = parseFloat(parts[1])
      
            if (isNaN(lat) || isNaN(lng)) throw { code: 400, message: "Venue coordinate must contain valid numbers" }
            if (lat < -90 || lat > 90) throw { code: 400, message: "Latitude must be between -90 and 90" }
            if (lng < -180 || lng > 180) throw { code: 400, message: "Longitude must be between -180 and 180" }
      
            return true
        })
]