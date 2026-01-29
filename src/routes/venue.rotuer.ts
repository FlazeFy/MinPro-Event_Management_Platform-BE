import { Router } from "express"
import { VenueController } from "../controllers/venue.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class VenueRouter {
    private route: Router
    private venueController: VenueController

    constructor(){
        this.route = Router()
        this.venueController = new VenueController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllVenueController } = this.venueController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getAllVenueController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}