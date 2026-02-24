import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { loginSchemaValidation } from "../middlewares/auth.validator"
import { customerRegisterValidation } from "../middlewares/customer.validator"
import { eventOrganizerRegisterValidation } from "../middlewares/event_organizer.validator"
import { validationCheck, validationCheckForProfileUpdate } from "../middlewares/template.validator"
import { memoryUploader } from "../middlewares/uploader.middleware"

export default class AuthRouter {
    private route: Router
    private authController: AuthController

    constructor(){
        this.route = Router()
        this.authController = new AuthController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { postLoginController, getRefreshTokenController, getMyProfileController, putUpdateProfileController, postRegisterCustomerController, postRegisterEventOrganizerController, postUpdateProfileImageController } = this.authController

        this.route.post("/login", loginSchemaValidation, validationCheck, postLoginController)
        this.route.post("/register/customer", memoryUploader().single("img"), customerRegisterValidation, validationCheck, postRegisterCustomerController)
        this.route.post("/register/event_organizer", memoryUploader().single("img"),  eventOrganizerRegisterValidation, validationCheck, postRegisterEventOrganizerController)
        this.route.get("/refresh", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getRefreshTokenController)
        this.route.get("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getMyProfileController)
        this.route.post("/edit-image", verifyAuthToken, authorizeRole(["event_organizer","customer"]), memoryUploader().single("img"), postUpdateProfileImageController)
        this.route.put("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), validationCheckForProfileUpdate, putUpdateProfileController)
    }

    public getRouter = (): Router => this.route
}