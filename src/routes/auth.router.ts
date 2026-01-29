import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { loginSchemaValidation, validationCheck } from "../middlewares/auth.validator"

export default class AuthRouter {
    private route: Router
    private authController: AuthController

    constructor(){
        this.route = Router()
        this.authController = new AuthController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postLogin } = this.authController

        this.route.post("/login", loginSchemaValidation, validationCheck, postLogin)
    }

    public getRouter = (): Router => {
        return this.route
    }
}