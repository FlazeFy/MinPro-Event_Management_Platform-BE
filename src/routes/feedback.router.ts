import { Router } from "express"
import { FeedbackController } from "../controllers/feedback.controller"
import { validationCheck } from "../middlewares/template.validator"
import { feedbackSchemaValidation } from "../middlewares/feedback.validator"

export default class FeedbackRouter {
    private route: Router
    private feedbackController: FeedbackController

    constructor(){
        this.route = Router()
        this.feedbackController = new FeedbackController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postCreateFeedbackController } = this.feedbackController

        this.route.post("/", feedbackSchemaValidation, validationCheck, postCreateFeedbackController)
    }

    public getRouter = (): Router => this.route
}