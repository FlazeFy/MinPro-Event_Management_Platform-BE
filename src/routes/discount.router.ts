import { Router } from "express"
import { DiscountController } from "../controllers/discount.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { discountSchemaValidation } from "../middlewares/discount.validator"
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
        const { getAllDiscountController, postCreateDiscountController, hardDeleteDiscountByIdController } = this.discountController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getAllDiscountController)
        this.route.post("/", verifyAuthToken, authorizeRole(["event_organizer"]), discountSchemaValidation, validationCheck, postCreateDiscountController)
        this.route.delete("/:id", verifyAuthToken, authorizeRole(["event_organizer"]), hardDeleteDiscountByIdController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}