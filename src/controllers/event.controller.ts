import { NextFunction, Request, Response } from "express"
import { extractUserFromAuthHeader } from "../utils/auth.util"
import { EventRepository } from "../repositories/event.repository"

export class EventController {
    private eventRepository: EventRepository

    constructor(){
        this.eventRepository = new EventRepository()
    }

    
    public getAllEventController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
            const eventOrganizerId = typeof req.query.event_organizer_id === 'string' ? req.query.event_organizer_id.trim() : null
    
            // Repository : Get all event
            const result = await this.eventRepository.findAllEventRepo(page, limit, search, eventOrganizerId)
            if (!result) throw { code: 404, message:  "Event not found" }
    
            // Success response
            res.status(200).json({
                message: "Get event successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getUpcomingEventController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)

            // Repository : Get upcoming event
            const result = await this.eventRepository.findUpcomingEventRepo(userId, role ?? "")
            if (!result) throw { code: 404, message:  "Event not found" }
    
            // Success response
            res.status(200).json({
                message: "Get event successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getEventByOrganizerIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Params & query
            const eventOrganizerId = req.params.eventOrganizerId as string
            const limit = Number(req.query.limit) || 6

            // Repository : Get event by organizer id
            const result = await this.eventRepository.findEventByOrganizerIdRepo(eventOrganizerId, limit)
            if (!result) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get event by organizer id successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
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
