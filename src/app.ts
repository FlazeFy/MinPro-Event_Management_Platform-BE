import dotenv from "dotenv"
dotenv.config()
import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import AuthRouter from "./routes/auth.router"

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
        this.app.use("/api/v1/auths", authRouter.getRouter())
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