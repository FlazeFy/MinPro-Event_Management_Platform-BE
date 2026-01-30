import { Router } from "express"
import { VenueController } from "../controllers/venue.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { validationCheck } from "../middlewares/template.validator"
import { venueSchemaValidation } from "../middlewares/venue.validator"

export default class VenueRouter {
    private route: Router
    private venueController: VenueController

    constructor(){
        this.route = Router()
        this.venueController = new VenueController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllVenueController, postCreateVenueController } = this.venueController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getAllVenueController)
        this.route.post("/", verifyAuthToken, authorizeRole(["event_organizer"]), venueSchemaValidation, validationCheck, postCreateVenueController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}