import { NextFunction, Request, Response } from "express"
import { AuthRepository } from "../repositories/auth.repository"
import { CustomerRepository } from "../repositories/customer.repository"
import { EventOrganizerRepository } from "../repositories/event_organizer.repository"
import { announcementEmailTemplate } from "../templates/announcement.template"
import { extractUserFromAuthHeader, hashPassword } from "../utils/auth.util"
import { sendEmail } from "../utils/mailer.util"
import { cloudinaryUpload } from "../configs/cloudinary"

export class AuthController {
    private authRepository: AuthRepository
    private customerRepository: CustomerRepository
    private eventOrganizerRepository: EventOrganizerRepository

    constructor(){
        this.authRepository = new AuthRepository()
        this.customerRepository = new CustomerRepository()
        this.eventOrganizerRepository = new EventOrganizerRepository()
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

    public getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
            let result 
    
            switch (role) {
                case "event_organizer":
                    // Repo : Get event organizer by id
                    result = await this.eventOrganizerRepository.findEventOrganizerByIdRepo(userId)
                    break;
                case "customer":
                    // Repo : Get customer by id
                    result = await this.customerRepository.findCustomerByIdRepo(userId)
                    break;
                default:
                    throw { code: 409, message:  "Role not valid" }
            }
    
            if (!result) throw { code: 404, message:  "User not found" }
    
            // Success response
            const finalRes = { ...result, role }
            res.status(200).json({
                message: "Get user successful",
                data: finalRes
            })
        } catch (error: any) {
            next(error)
        }
    }

    public putUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)
            let result, newData
    
            switch (role) {
                case "event_organizer": {
                    // Repo : Get event organizer by id
                    result = await this.eventOrganizerRepository.findEventOrganizerByIdRepo(userId)
                    if (!result) throw { code: 404, message:  "User not found" }

                    // Repo : Update event organizer by id
                    const { username, email, organizer_name, phone_number, address, bio } = req.body
                    newData = await this.eventOrganizerRepository.updateEventOrganizerByIdRepo(userId, username, email, organizer_name, phone_number, address, bio)

                    break;
                } case "customer":
                    // Repo : Get customer by id
                    result = await this.customerRepository.findCustomerByIdRepo(userId)
                    if (!result) throw { code: 404, message:  "User not found" }

                    // Repo : Update event organizer by id
                    const { username, email, fullname, phone_number, birth_date } = req.body
                    newData = await this.customerRepository.updateCustomerByIdRepo(userId, username, email, fullname, phone_number, birth_date)

                    break;
                default:
                    throw { code: 409, message:  "Role not valid" }
            }
    
            if (!result) throw { code: 404, message:  "User not found" }
    
            // Success response
            res.status(200).json({
                message: "Update profile successful",
                data: newData
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postRegisterCustomer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Body
            const { username, email, password, password_confirmation, fullname, phone_number, birth_date } = req.body

            // Validation password confirmation
            if (password !== password_confirmation) throw { code: 401, message: "Password confrimation is not match" }

            // Repo : Uniqueness of username or email
            const isExist = await this.customerRepository.checkUsernameOrEmailExistRepo(username, email)
            if (isExist) throw { code: 409, message: "Username or email already used" }

            // Image upload
            let filePath: string | null = null 
            if (req.file) { 
                const result = await cloudinaryUpload(req.file) 
                filePath = result.secure_url 
            }

            // Repo : Register
            const hashedPassword = await hashPassword(password)
            const result = await this.customerRepository.createCustomerRepo(username, email, hashedPassword, fullname, phone_number, birth_date, filePath)

            // Broadcast email
            await sendEmail(
                email, "Account Registered!",
                announcementEmailTemplate(
                    email.split("@")[0],
                    `Hi ${username}, Welcome to EventKu! Your registration is complete. We hope you enjoy your experience with us`
                )
            )
            
            // Success response
            return res.status(201).json({
                message: "Register successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postRegisterEventOrganizer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Body
            const { username, email, password, password_confirmation, organizer_name, phone_number, bio, address } = req.body

            // Validation password confirmation
            if (password !== password_confirmation) throw { code: 401, message: "Password confrimation is not match" }

            // Repo : Uniqueness of username or email
            const isExist = await this.eventOrganizerRepository.checkUsernameOrEmailExistRepo(username, email)
            if (isExist) throw { code: 409, message: "Username or email already used" }

            // Image upload
            let filePath: string | null = null 
            if (req.file) { 
                const result = await cloudinaryUpload(req.file) 
                filePath = result.secure_url 
            }

            // Repo : Register
            const hashedPassword = await hashPassword(password)
            const result = await this.eventOrganizerRepository.createEventOrganizerRepo(username, email, hashedPassword, organizer_name, phone_number, bio, address, filePath)

            // Broadcast email
            await sendEmail(
                email, "Account Registered!",
                announcementEmailTemplate(
                    email.split("@")[0],
                    `Hi ${username}, Welcome to EventKu! Your registration is complete. We hope you enjoy your experience with us`
                )
            )
            
            // Success response
            return res.status(201).json({
                message: "Register successful",
                data: result,
            })
        } catch (error: any) {
            next(error)
        }
    }
}