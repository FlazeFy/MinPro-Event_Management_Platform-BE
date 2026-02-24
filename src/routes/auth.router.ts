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
        const { postLogin, getRefreshToken, getMyProfile, putUpdateProfile, postRegisterCustomer, postRegisterEventOrganizer, postUpdateProfileImage } = this.authController

        this.route.post("/login", loginSchemaValidation, validationCheck, postLogin)
        this.route.post("/register/customer", memoryUploader().single("img"), customerRegisterValidation, validationCheck, postRegisterCustomer)
        this.route.post("/register/event_organizer", memoryUploader().single("img"),  eventOrganizerRegisterValidation, validationCheck, postRegisterEventOrganizer)
        this.route.get("/refresh", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getRefreshToken)
        this.route.get("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getMyProfile)
        this.route.post("/edit-image", verifyAuthToken, authorizeRole(["event_organizer","customer"]), memoryUploader().single("img"), postUpdateProfileImage)
        this.route.put("/profile", verifyAuthToken, authorizeRole(["event_organizer","customer"]), validationCheckForProfileUpdate, putUpdateProfile)
    }

    public getRouter = (): Router => this.route
}