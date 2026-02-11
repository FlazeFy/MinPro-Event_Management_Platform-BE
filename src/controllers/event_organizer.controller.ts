import { NextFunction, Request, Response } from "express"
import { EventOrganizerRepository } from "../repositories/event_organizer.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class EventOrganizerController {
    private eventOrganizerRepository: EventOrganizerRepository

    constructor(){
        this.eventOrganizerRepository = new EventOrganizerRepository()
    }

    public getAllEventOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
            const eventOrganizerId = typeof req.query.event_organizer_id === 'string' ? req.query.event_organizer_id.trim() : null
    
            // Repository : Get all event organizer
            const result = await this.eventOrganizerRepository.findAllEventOrganizerRepo(page, limit, search, eventOrganizerId)
            if (!result) throw { code: 404, message:  "Event Organizer not found" }
    
            // Success response
            res.status(200).json({
                message: "Get event organizer successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getEventOrganizerDetailByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Param
            const id = req.params.id as string
            // Query
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
            const event_category = typeof req.query.event_category === 'string' ? req.query.event_category.trim() : null
            const price_min = Number(req.query.price_min) || null
            const price_max = Number(req.query.price_max) || null
    
            // Repository : Get event organizer detail
            const result = await this.eventOrganizerRepository.findEventOrganizerDetailByIdRepo(id, page, limit, search, event_category !== 'all' ? event_category : null, price_max, price_min)
            if (!result) throw { code: 404, message:  "Event Organizer not found" }
    
            // Success response
            res.status(200).json({
                message: "Get event organizer successful",
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