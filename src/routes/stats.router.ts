import { Router } from "express"
import { StatsController } from "../controllers/stats.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { validateParamMiddleware } from "../middlewares/template.validator"
import { templateCustomerIdParamSchema, templateEventIdParamSchema } from "../middlewares/param.validator"

export default class StatsRouter {
    private route: Router
    private statsController: StatsController

    constructor(){
        this.route = Router()
        this.statsController = new StatsController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getEventOrganizerSummaryController, getPeriodicRevenueController, getPeriodicEventAttendeeController, getCustomerTransactionByEventOrganizerController, getTransactionDashboardController } = this.statsController

        this.route.get("/summary/event_organizer", verifyAuthToken, authorizeRole(["event_organizer"]), getEventOrganizerSummaryController)
        this.route.get("/periodic/revenue", verifyAuthToken, authorizeRole(["event_organizer"]), getPeriodicRevenueController)
        this.route.get("/periodic/attendee", verifyAuthToken, authorizeRole(["event_organizer"]), getPeriodicEventAttendeeController)
        this.route.get("/transaction/by_customer/:customer_id", verifyAuthToken, authorizeRole(["event_organizer"]), validateParamMiddleware(templateCustomerIdParamSchema), getCustomerTransactionByEventOrganizerController)
        this.route.get("/transaction/by_event/:event_id", verifyAuthToken, authorizeRole(["event_organizer"]), validateParamMiddleware(templateEventIdParamSchema), getTransactionDashboardController)
    }

    public getRouter = (): Router => this.route
}