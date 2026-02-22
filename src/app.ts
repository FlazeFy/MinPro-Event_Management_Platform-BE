import dotenv from "dotenv"
dotenv.config()
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import AuthRouter from "./routes/auth.router"
import VenueRouter from "./routes/venue.router"
import DiscountRouter from "./routes/discount.router"
import EventOrganizerRouter from "./routes/event_organizer.router"
import { auditError } from "./utils/audit.util"
import EventRouter from "./routes/event.router"
import path from "path"
import StatsRouter from "./routes/stats.router"
import TransactionRouter from "./routes/transaction.router"
import FeedbackRouter from "./routes/feedback.router"

const PORT = process.env.PORT

class App {
    public app: Application

    constructor(){
        this.app = express()
        this.configure()
        this.router()
        this.errorHandler()
    }

    // Configure middleware
    private configure = () => {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.static(path.join(__dirname,"public")))
    }

    // Route configuration
    private router = () => {
        this.app.get("/", (req: Request, res: Response) => {
            res.status(200).send("<h1>EventKu</h1>")
        })

        const authRouter = new AuthRouter()
        const venueRouter = new VenueRouter()
        const discountRouter = new DiscountRouter()
        const eventOrganizerRouter = new EventOrganizerRouter()
        const statsRouter = new StatsRouter()
        const transactionRouter = new TransactionRouter()
        const eventRouter = new EventRouter()
        const feedbackRouter = new FeedbackRouter()
        this.app.use("/api/v1/auths", authRouter.getRouter())
        this.app.use("/api/v1/venues", venueRouter.getRouter())
        this.app.use("/api/v1/discounts", discountRouter.getRouter())
        this.app.use("/api/v1/event_organizers", eventOrganizerRouter.getRouter())
        this.app.use("/api/v1/events", eventRouter.getRouter())
        this.app.use("/api/v1/stats", statsRouter.getRouter())
        this.app.use("/api/v1/transactions", transactionRouter.getRouter())
        this.app.use("/api/v1/feedbacks", feedbackRouter.getRouter())
    }

    // Error handling
    private errorHandler = () => {
        this.app.use((err: any, req: Request, res: Response, next:NextFunction) => {
            // Multer file upload limit size
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "File size exceeds 2MB limit"
                })
            }
    
            const statusCode = err.status || err.code || 500
            // Audit server error
            if (statusCode === 500) {
                auditError(err, req)

                return res.status(500).json({
                    message: "Something went wrong",
                })
            }

            return res.status(statusCode).json({
                message: err.message,
            })
        })
    }

    // Exec the App
    public startAPI = () => {
        this.app.listen(PORT, () => {
            console.log(`API Running at http://localhost:${PORT}`)
        })
    }
}

export default App