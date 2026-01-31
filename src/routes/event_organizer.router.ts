import { Router } from "express"
import { EventOrganizerController } from "../controllers/event_organizer.controller"

export default class EventOrganizerRouter {
    private route: Router
    private eventOrganizerController: EventOrganizerController

    constructor(){
        this.route = Router()
        this.eventOrganizerController = new EventOrganizerController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllEventOrganizerController } = this.eventOrganizerController

        this.route.get("/", getAllEventOrganizerController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}