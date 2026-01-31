import dotenv from "dotenv"
dotenv.config()
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import AuthRouter from "./routes/auth.router"
import VenueRouter from "./routes/venue.router"
import DiscountRouter from "./routes/discount.router"
import EventOrganizerRouter from "./routes/event_organizer.router"

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
            res.status(err.code || 500).send(err)
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