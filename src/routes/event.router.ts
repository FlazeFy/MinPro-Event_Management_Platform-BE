import { Router } from "express"
import { EventController } from "../controllers/event.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { validationCheck } from "../middlewares/template.validator"
import { createEventSchemaValidation } from "../middlewares/event.validator"
import { memoryUploader } from "../middlewares/uploader.middleware"

export default class EventRouter {
    private route: Router
    private eventController: EventController

    constructor(){
        this.route = Router()
        this.eventController = new EventController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const {
            hardDeleteEventByIdController,
            getAllEventController,
            getUpcomingEventController,
            getRecentEventByOrganizerController,
            postCreateEventController,
            getEventAttendeeByEventIdController,
            getEventDetailById,
            getMyEventController
        } = this.eventController

        this.route.post("/", verifyAuthToken, authorizeRole(["event_organizer"]), memoryUploader().single("img"), createEventSchemaValidation, validationCheck, postCreateEventController)
        this.route.delete("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), hardDeleteEventByIdController)
        this.route.get("/", getAllEventController)
        this.route.get("/detail/:id", getEventDetailById)
        this.route.get("/attendee/:id", verifyAuthToken, authorizeRole(["event_organizer"]), getEventAttendeeByEventIdController)
        this.route.get("/upcoming", verifyAuthToken, authorizeRole(["event_organizer", "customer"]), getUpcomingEventController)
        this.route.get("/recent", verifyAuthToken, authorizeRole(["event_organizer"]), getRecentEventByOrganizerController)
        this.route.get("/my", verifyAuthToken, authorizeRole(["event_organizer"]), getMyEventController)
    }

    public getRouter = (): Router => this.route
}
