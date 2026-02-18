import { NextFunction, Request, Response } from "express"
import { FeedbackRepository } from "../repositories/feedback.repository"

export class FeedbackController {
    private feedbackRepository: FeedbackRepository

    constructor(){
        this.feedbackRepository = new FeedbackRepository()
    }

    public postCreateFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Request body
            const { feedback_rate, feedback_body } = req.body
    
            // Repository : Create feedback
            const result = await this.feedbackRepository.createFeedbackRepo(feedback_rate, feedback_body)
            if (!result) throw { code: 500, message: "Something went wrong" }
    
            // Success response
            return res.status(201).json({
                message: "Feedback sended"
            })
        } catch (error: any) {
            next(error)
        }
    }
}