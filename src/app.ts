import dotenv from "dotenv"
dotenv.config()
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import AuthRouter from "./routes/auth.router"
import VenueRouter from "./routes/venue.router"
import DiscountRouter from "./routes/discount.router"
import EventOrganizerRouter from "./routes/event_organizer.router"
import { auditError } from "./utils/audit.util"

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
        this.app.use("/api/v1/auths", authRouter.getRouter())
        this.app.use("/api/v1/venues", venueRouter.getRouter())
        this.app.use("/api/v1/discounts", discountRouter.getRouter())
        this.app.use("/api/v1/event_organizers", eventOrganizerRouter.getRouter())
    }

    // Error handling
    private errorHandler = () => {
        this.app.use((err: any, req: Request, res: Response, next:NextFunction) => {
            const statusCode = err.code || 500

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