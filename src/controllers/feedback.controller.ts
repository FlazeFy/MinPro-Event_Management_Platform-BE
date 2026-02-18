import { NextFunction, Request, Response } from "express"
import { FeedbackRepository } from "../repositories/feedback.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class FeedbackController {
    private feedbackRepository: FeedbackRepository

    constructor(){
        this.feedbackRepository = new FeedbackRepository()
    }

    public postCreateFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Request body
            const { feedback_rate, feedback_body } = req.body

            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
    
            // Repository : Create feedback
            const result = await this.feedbackRepository.createFeedbackRepo(feedback_rate, feedback_body, userId, role ?? "")
            if (!result) throw { code: 500, message: "Something went wrong" }
    
            // Success response
            return res.status(201).json({
                message: "Feedback sended"
            })
        } catch (error: any) {
            next(error)
        }
    }

    public getRandomFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const limit = Number(req.query.limit) || 3
    
            // Repository : Get random feedback
            const result = await this.feedbackRepository.findRandomFeedbackRepo(limit)
            if (!result) throw { code: 404, message: "Feedback not found" }
    
            // Success response
            return res.status(200).json({
                message: "Get feedback successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }
}