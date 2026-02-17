import { Router } from "express"
import { TransactionController } from "../controllers/transaction.controller"
import { authorizeRole, verifyAuthToken } from "../middlewares/auth.middleware"

export default class TransactionRouter {
    private route: Router
    private transactionController: TransactionController

    constructor(){
        this.route = Router()
        this.transactionController = new TransactionController()
        this.initializeRoute()
    }

    private initializeRoute = () => {
        const { getAllTransactionController } = this.transactionController

        this.route.get("/", verifyAuthToken, authorizeRole(["event_organizer"]), getAllTransactionController)
    }

    public getRouter = (): Router => this.route
}