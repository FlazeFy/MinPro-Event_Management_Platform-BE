import { NextFunction, Request, Response } from "express"
import { EventScheduleRepository } from "../repositories/event_schedule.repository"

export class EventScheduleController {
    private eventScheduleRepository: EventScheduleRepository

    constructor() {
        this.eventScheduleRepository = new EventScheduleRepository()
    }
 
    public getAllEventScheduleController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const startDateRaw = typeof req.query.start_date === 'string' ? req.query.start_date.trim() : null
            const endDateRaw = typeof req.query.end_date === 'string' ? req.query.end_date.trim() : null

            const startDate = startDateRaw ? new Date(startDateRaw) : null
            const endDate = endDateRaw ? new Date(endDateRaw) : null

            if (startDate && Number.isNaN(startDate.getTime())) throw { code: 400, message: "Invalid start_date format" }
            if (endDate && Number.isNaN(endDate.getTime())) throw { code: 400, message: "Invalid end_date format" }
            if (startDate && endDate && startDate > endDate) throw { code: 400, message: "start_date cannot be greater than end_date" }
            
            const result = await this.eventScheduleRepository.findAllEventScheduleRepo(page, limit, startDate, endDate)
            if (!result) throw { code: 404, message:  "Event Schedule not found" }
    
            // Success response
            res.status(200).json({
                message: "Get Event schedule successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
            })
        } catch (error: any) {
            next(error)
        }
    }
}
