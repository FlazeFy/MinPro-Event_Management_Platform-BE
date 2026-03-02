import { NextFunction, Request, Response } from "express"
import { DiscountRepository } from "../repositories/discount.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class DiscountController {
    private discountRepository: DiscountRepository

    constructor(){
        this.discountRepository = new DiscountRepository()
    }

    public getDiscountByEventOrganizerController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const eventOrganizerId = req.params.event_organizer_id as string

            // Get user id from auth token
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Get discount by event organizer id
            const result = await this.discountRepository.findDiscountByEventOrganizerRepo(eventOrganizerId, userId, role ?? "")
            if (!result || result.length === 0) throw { code: 404, message:  "Discount not found" }
    
            // Success response
            res.status(200).json({
                message: "Get discount successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getMyDiscountController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id from auth token
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)

            // Query params for pagination
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
    
            // Repository : Get my discount
            const result = await this.discountRepository.findMyDiscountRepo(page, limit, userId, role ?? "")
            if (!result || result.data.length === 0) throw { code: 404, message:  "Discount not found" }
    
            // Success response
            res.status(200).json({
                message: "Get discount successful",
                data: result.data,
                meta: {
                    page,
                    limit,
                    total: result.total,
                },
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postCreateDiscountController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Request body
            const { percentage, description } = req.body

            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Create discount
            const result = await this.discountRepository.createDiscountRepo(userId, parseInt(percentage), description)
            if (!result) throw { code: 500, message:  "Something went wrong" }
    
            // Success response
            res.status(201).json({
                message: "Discount created"
            })
        } catch (error: any) {
            next(error)
        }
    }

    public putUpdateDiscountByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const discountId = req.params.id as string

            // Request body
            const { description } = req.body

            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Create discount
            const result = await this.discountRepository.updateDiscountByIdRepo(discountId, userId, description)
            if (!result) throw { code: 404, message:  "Discount not found" }
    
            // Success response
            res.status(200).json({
                message: "Discount updated"
            })
        } catch (error: any) {
            next(error)
        }
    }

    public hardDeleteDiscountByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const discountId = req.params.id as string

            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Hard delete discount by id
            const result = await this.discountRepository.deleteDiscountByIdRepo(userId, discountId)
            if (!result) throw { code: 500, message:  "Something went wrong" }
    
            // Success response
            res.status(200).json({
                message: "Discount deleted"
            })
        } catch (error: any) {
            next(error)
        }
    }
}