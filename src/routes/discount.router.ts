import { Router } from "express"
import { DiscountController } from "../controllers/discount.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { discountSchemaValidation, discountUpdateSchemaValidation } from "../middlewares/discount.validator"
import { validationCheck } from "../middlewares/template.validator"

export default class DiscountRouter {
    private route: Router
    private discountController: DiscountController

    constructor(){
        this.route = Router()
        this.discountController = new DiscountController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { 
            getDiscountByEventOrganizerController, postCreateDiscountController, hardDeleteDiscountByIdController, getMyDiscountController, putUpdateDiscountByIdController 
        } = this.discountController

        this.route.get("/:event_organizer_id", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getDiscountByEventOrganizerController)
        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getMyDiscountController)
        this.route.post("/", verifyAuthToken, authorizeRole(["event_organizer"]), discountSchemaValidation, validationCheck, postCreateDiscountController)
        this.route.put("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), discountUpdateSchemaValidation, validationCheck, putUpdateDiscountByIdController)
        this.route.delete("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), hardDeleteDiscountByIdController)
    }

    public getRouter = (): Router => this.route
}