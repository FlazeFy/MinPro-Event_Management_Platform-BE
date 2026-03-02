import { NextFunction, Request, Response } from "express"
import { EventCategory } from "../generated/prisma/client"
import { EventRepository } from "../repositories/event.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"
import { NullsOrder } from "../generated/prisma/internal/prismaNamespaceBrowser"

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
            const category = typeof req.query.category === 'string' ? req.query.category.trim() : null
            const maxPrice =  Number(req.query.price) || null

            // Repository : Get all event
            const result = await this.eventRepository.findAllEventRepo(page, limit, search, category, maxPrice)
            if (!result || result.data.length === 0) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get event successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
                max_price: result.max_price
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getEventDetailById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const id = req.params.id as string

            // Repository : Get event by id
            const result = await this.eventRepository.findEventByIdRepo(id)
            if (!result) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get event successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postCreateEventController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id from auth token
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Request body
            const {
                event_title, event_desc, event_category, event_price, is_paid, maximum_seat, venue_id, start_date, end_date, description,
            } = req.body

            const startDate = new Date(start_date)
            const endDate = new Date(end_date)
            if (!venue_id) throw { code: 400, message: "venue_id is required" }
            if (Number.isNaN(startDate.getTime())) throw { code: 400, message: "Invalid start_date format" }
            if (Number.isNaN(endDate.getTime())) throw { code: 400, message: "Invalid end_date format" }
            if (startDate >= endDate) throw { code: 400, message: "end_date must be greater than start_date" }

            // Repository : Create event
            const result = await this.eventRepository.createEventRepo(
                userId, event_title, event_desc, event_category as EventCategory, Number(event_price) || 0, Boolean(is_paid),
                Number(maximum_seat) || 0, venue_id, startDate, endDate, description,
            )
            if (!result) throw { code: 500, message: "Something went wrong" }

            // Success response
            res.status(201).json({
                message: "Event created",
                data: result,
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
            if (!result || result.length === 0) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get event successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getRecentEventByOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id from auth token
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Query params for pagination
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null

            // Repository : Get recent event by organizer id from auth token
            const result = await this.eventRepository.findRecentEventByOrganizerRepo(userId, page, limit, search)
            if (!result || result.data.length === 0) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get recent event successful",
                data: result.data,
                meta: {
                    page,
                    limit,
                    total: result.total,
                    total_page: Math.ceil(result.total / limit),
                },
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getEventAttendeeByEventIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const eventId = req.params.id as string

            // Get user id from auth token
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Query params for pagination
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null

            // Repository : Get event attendee by event id
            const result = await this.eventRepository.findEventAttendeeByEventIdRepo(userId, eventId, page, limit, search)
            if (!result || result.data.length === 0) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Get event attendee successful",
                data: result.data,
                meta: {
                    page,
                    limit,
                    total: result.total
                },
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
            if (!result) throw { code: 404, message: "Event not found" }

            // Success response
            res.status(200).json({
                message: "Event deleted"
            })
        } catch (error: any) {
            next(error)
        }
    }
}
