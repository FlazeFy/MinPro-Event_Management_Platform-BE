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

            // Repo : Login
            const result = await this.authRepository.loginRepo(email, password)
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

    public getRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Auth header
            const authHeader = req.headers.authorization
            const refreshToken = authHeader?.split(" ")[1]

            if (!refreshToken) throw { code: 400, message:  "Refresh token required" }

            // Repo : Refresh token
            const result = await this.authRepository.refreshTokenRepo(refreshToken)
            if (!result) throw { code: 401, message:  "Invalid refresh token" }

            // Success response
            return res.status(200).json({
                message: "Token refreshed successfully",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }
}