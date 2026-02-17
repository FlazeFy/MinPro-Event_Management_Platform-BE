import { Router } from "express"
import { StatsController } from "../controllers/stats.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class StatsRouter {
    private route: Router
    private statsController: StatsController

    constructor(){
        this.route = Router()
        this.statsController = new StatsController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getEventOrganizerSummary, getPeriodicRevenue } = this.statsController

        this.route.get("/summary/event_organizer", verifyAuthToken, authorizeRole(["event_organizer"]), getEventOrganizerSummary)
        this.route.get("/periodic/revenue", verifyAuthToken, authorizeRole(["event_organizer"]), getPeriodicRevenue)
    }

    public getRouter = (): Router => this.route
}