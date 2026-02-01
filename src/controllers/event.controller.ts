import { NextFunction, Request, Response } from "express"
import { extractUserFromAuthHeader } from "../utils/auth.util"
import { EventRepository } from "../repositories/event.repository"

export class EventController {
    private eventRepository: EventRepository

    constructor(){
        this.eventRepository = new EventRepository()
    }

    public hardDeleteEventByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const eventId = req.params.id as string

            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Hard delete event by id
            const result = await this.eventRepository.deleteEventByIdRepo(userId, eventId)
            if (!result) throw { code: 404, message:  "Event not found" }
    
            // Success response
            res.status(200).json({
                message: "Event deleted"
            })
        } catch (error: any) {
            next(error)
        }
    }
}