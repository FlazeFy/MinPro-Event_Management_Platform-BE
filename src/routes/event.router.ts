import { Router } from "express"
import { EventController } from "../controllers/event.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class EventRouter {
    private route: Router
    private eventController: EventController

    constructor(){
        this.route = Router()
        this.eventController = new EventController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { hardDeleteEventByIdController } = this.eventController

        this.route.delete("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), hardDeleteEventByIdController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}