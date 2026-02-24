import { Router } from "express"
import { ReferralCodeController } from "../controllers/referral_code.controller"
import { validationCheck } from "../middlewares/template.validator"
import { refCodeValidation } from "../middlewares/customer.validator"

export default class ReferralCodeRouter {
    private route: Router
    private refCodeController: ReferralCodeController

    constructor(){
        this.route = Router()
        this.refCodeController = new ReferralCodeController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postUseRefCodeController } = this.refCodeController

        this.route.post("/", refCodeValidation, validationCheck, postUseRefCodeController)
    }

    public getRouter = (): Router => this.route
}