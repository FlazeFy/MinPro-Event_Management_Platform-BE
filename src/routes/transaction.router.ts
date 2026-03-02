import { Router } from "express"
import { TransactionController } from "../controllers/transaction.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"
import { validationCheck } from "../middlewares/template.validator"
import { transactionSchemaValidation } from "../middlewares/transaction.validator"
import { memoryUploader } from "../middlewares/uploader.middleware"

export default class TransactionRouter {
    private route: Router
    private transactionController: TransactionController

    constructor(){
        this.route = Router()
        this.transactionController = new TransactionController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllTransactionController, postCreateTransactionController, postUpdateTransactionEvidenceController } = this.transactionController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer","customer"]), getAllTransactionController)
        this.route.post("/", verifyAuthToken, authorizeRole(["customer"]), transactionSchemaValidation, validationCheck, postCreateTransactionController)
        this.route.post("/payment-evidence", verifyAuthToken, authorizeRole(["customer"]), memoryUploader().single("img"), postUpdateTransactionEvidenceController)
    }

    public getRouter = (): Router => this.route
}