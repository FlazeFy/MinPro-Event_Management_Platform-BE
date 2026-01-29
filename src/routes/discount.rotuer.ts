import { Router } from "express"
import { DiscountController } from "../controllers/discount.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class DiscountRouter {
    private route: Router
    private discountController: DiscountController

    constructor(){
        this.route = Router()
        this.discountController = new DiscountController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllDiscountController } = this.discountController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getAllDiscountController)
    }

    public getRouter = (): Router => {
        return this.route
    }
}