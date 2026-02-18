import { Router } from "express"
import { FeedbackController } from "../controllers/feedback.controller"
import { validationCheck } from "../middlewares/template.validator"
import { feedbackSchemaValidation } from "../middlewares/feedback.validator"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class FeedbackRouter {
    private route: Router
    private feedbackController: FeedbackController

    constructor(){
        this.route = Router()
        this.feedbackController = new FeedbackController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postCreateFeedbackController, getRandomFeedbackController } = this.feedbackController

        this.route.post("/", verifyAuthToken, authorizeRole(["event_organizer", "customer"]), feedbackSchemaValidation, validationCheck, postCreateFeedbackController)
        this.route.get("/random", getRandomFeedbackController)
    }

    public getRouter = (): Router => this.route
}