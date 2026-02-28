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
    
            // Repository : Get all discount
            const result = await this.discountRepository.findDiscountByEventOrganizerRepo(eventOrganizerId)
            if (!result) throw { code: 404, message:  "Discount not found" }
    
            // Success response
            res.status(200).json({
                message: "Get discount successful",
                data: result,
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

    public hardDeleteDiscountByIdController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get params
            const discountId = req.params.id as string

            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
    
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