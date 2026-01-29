import { NextFunction, Request, Response } from "express"
import { AuthRepository } from "../repositories/auth.repository"

export class AuthController {
    private authRepository: AuthRepository

    constructor(){
        this.authRepository = new AuthRepository()
    }

    public postLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Body
            const { email, password } = req.body

            // Repository : Login
            const result = await this.authRepository.loginRepository(email, password)
            if (!result) throw { code: 401, message: "Invalid email or password" }

            // Success response
            return res.status(200).json({
                message: "Login successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }
}