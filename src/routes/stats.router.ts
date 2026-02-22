import { Router } from "express"
import { StatsController } from "../controllers/stats.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { validateParamMiddleware } from "../middlewares/template.validator"
import { templateCustomerIdParamSchema } from "../middlewares/param.validator"

export default class StatsRouter {
    private route: Router
    private statsController: StatsController

    constructor(){
        this.route = Router()
        this.statsController = new StatsController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getEventOrganizerSummary, getPeriodicRevenue, getPeriodicEventAttendee, getCustomerTransactionByEventOrganizerController } = this.statsController

        this.route.get("/summary/event_organizer", verifyAuthToken, authorizeRole(["event_organizer"]), getEventOrganizerSummary)
        this.route.get("/periodic/revenue", verifyAuthToken, authorizeRole(["event_organizer"]), getPeriodicRevenue)
        this.route.get("/periodic/attendee", verifyAuthToken, authorizeRole(["event_organizer"]), getPeriodicEventAttendee)
        this.route.get("/transaction/:customer_id", verifyAuthToken, authorizeRole(["event_organizer"]), validateParamMiddleware(templateCustomerIdParamSchema), getCustomerTransactionByEventOrganizerController)
    }

    public getRouter = (): Router => this.route
}