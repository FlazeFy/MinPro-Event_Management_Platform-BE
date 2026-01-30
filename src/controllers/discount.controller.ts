import { NextFunction, Request, Response } from "express"
import { DiscountRepository } from "../repositories/discount.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class DiscountController {
    private discountRepository: DiscountRepository

    constructor(){
        this.discountRepository = new DiscountRepository()
    }

    public getAllDiscountController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
            const eventOrganizerId = typeof req.query.event_organizer_id === 'string' ? req.query.event_organizer_id.trim() : null
    
            // Repository : Get all discount
            const result = await this.discountRepository.findAllDiscountRepo(page, limit, search, eventOrganizerId)
            if (!result) throw { code: 404, message:  "Discount not found" }
    
            // Success response
            res.status(200).json({
                message: "Get discount successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
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
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Create discount
            const result = await this.discountRepository.createDiscountRepo(userId, parseInt(percentage), description)
            if (!result) throw { code: 500, message:  "Something went wrong" }
    
            // Success response
            res.status(201).json({
                message: "Discount created",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }
}