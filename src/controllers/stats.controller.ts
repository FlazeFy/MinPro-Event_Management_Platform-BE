import { NextFunction, Request, Response } from "express"
import { EventOrganizerRepository } from "../repositories/event_organizer.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"
import { TransactionRepository } from "../repositories/transaction.repository"
import { AttendeeRepository } from "../repositories/attendee.repository"

export class StatsController {
    private eventOrganizerRepository: EventOrganizerRepository
    private transactionRepository: TransactionRepository
    private attendeeRepository: AttendeeRepository

    constructor(){
        this.eventOrganizerRepository = new EventOrganizerRepository()
        this.transactionRepository = new TransactionRepository()
        this.attendeeRepository = new AttendeeRepository()
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

    public getPeriodicRevenue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Repository : Get event periodic revenue
            const result = await this.transactionRepository.findEventPeriodicRevenueByOrganizerId(userId)
    
            // Success response
            res.status(200).json({
                message: "Get event organizer stats successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getPeriodicEventAttendee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Repository : Get total event attendee periodic
            const result = await this.attendeeRepository.findEventAttendeePeriodicByOrganizerId(userId)
    
            // Success response
            res.status(200).json({
                message: "Get event organizer stats successful",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getCustomerTransactionByEventOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const customerId = req.params.customer_id as string

            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
    
            // Repository : Get all transaction
            const result = await this.transactionRepository.findCustomerTransactionByEventOrganizerRepo(page, limit, search, customerId)
            if (!result) throw { code: 404, message:  "Transaction not found" }
    
            // Success response
            res.status(200).json({
                message: "Get transaction successful",
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