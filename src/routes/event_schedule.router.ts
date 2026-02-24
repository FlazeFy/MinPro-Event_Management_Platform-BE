import { Router } from "express"
import { EventScheduleController } from "../controllers/event_schedule.controller"

export default class EventScheduleRouter {
    private route: Router
    private eventScheduleController: EventScheduleController

    constructor(){
        this.route = Router()
        this.eventScheduleController = new EventScheduleController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllEventScheduleController } = this.eventScheduleController

        this.route.get("/search", getAllEventScheduleController)
        this.route.get("/", getAllEventScheduleController)
    }

    public getRouter = (): Router => this.route
}
