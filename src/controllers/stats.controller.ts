import { NextFunction, Request, Response } from "express"
import { EventOrganizerRepository } from "../repositories/event_organizer.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class StatsController {
    private eventOrganizerRepository: EventOrganizerRepository

    constructor(){
        this.eventOrganizerRepository = new EventOrganizerRepository()
    }

    public getEventOrganizerSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Repository : Get summary event organizer
            const result = await this.eventOrganizerRepository.findEventOrganizerSummaryById(userId)
    
            // Success response
            res.status(200).json({
                message: "Get event organizer stats successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }
}