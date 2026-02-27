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
        const { hardDeleteEventByIdController, getAllEventController, getUpcomingEventController } = this.eventController

        this.route.delete("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), hardDeleteEventByIdController)
        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer", "customer"]), getAllEventController)
        this.route.get("/upcoming", verifyAuthToken, authorizeRole(["event_organizer", "customer"]), getUpcomingEventController)
    }

    public getRouter = (): Router => this.route
}