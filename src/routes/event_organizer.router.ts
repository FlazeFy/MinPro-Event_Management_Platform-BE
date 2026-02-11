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
        const { getAllEventOrganizerController, getEventOrganizerDetailByIdController, getTrendingEventOrganizer } = this.eventOrganizerController

        this.route.get("/", getAllEventOrganizerController)
        this.route.get("/detail/:id", getEventOrganizerDetailByIdController)
        this.route.get("/trend", getTrendingEventOrganizer)
    }

    public getRouter = (): Router => {
        return this.route
    }
}