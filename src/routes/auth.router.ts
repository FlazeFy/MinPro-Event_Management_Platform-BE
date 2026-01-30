import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { loginSchemaValidation } from "../middlewares/auth.validator"
import { validationCheck, validationCheckForProfileUpdate } from "../middlewares/template.validator"

export default class AuthRouter {
    private route: Router
    private authController: AuthController

    constructor(){
        this.route = Router()
        this.authController = new AuthController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postLogin, getRefreshToken, getMyProfile, putUpdateProfile } = this.authController

        this.route.post("/login", loginSchemaValidation, validationCheck, postLogin)
        this.route.get("/refresh", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getRefreshToken)
        this.route.get("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getMyProfile)
        this.route.put("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), validationCheckForProfileUpdate, putUpdateProfile)
    }

    public getRouter = (): Router => {
        return this.route
    }
}