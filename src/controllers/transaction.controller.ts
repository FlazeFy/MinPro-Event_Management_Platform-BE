import { NextFunction, Request, Response } from "express"
import { TransactionRepository } from "../repositories/transaction.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"
import { sendEmail } from "../utils/mailer.util"
import { CustomerRepository } from "../repositories/customer.repository"
import { announcementEmailTemplate } from "../templates/announcement.template"
import { cloudinaryUpload } from "../configs/cloudinary"

export class TransactionController {
    private transactionRepository: TransactionRepository
    private customerRepository: CustomerRepository

    constructor(){
        this.transactionRepository = new TransactionRepository()
        this.customerRepository = new CustomerRepository()
    }

    public getAllTransactionController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId, role } = extractUserFromAuthHeader(req.headers.authorization)

            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
            const status = typeof req.query.status === 'string' ? req.query.status.trim() : null
    
            // Repository : Get all transaction
            const result = await this.transactionRepository.findAllTransactionRepo(page, limit, search, status === "all" ? null : status, userId, role ?? "")
            if (!result || result.data.length === 0) throw { code: 404, message:  "Transaction not found" }
    
            // Success response
            res.status(200).json({
                message: "Get transaction successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
                average_transaction: result.average_transaction
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postCreateTransactionController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id from auth token
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Request body
            const { payment_method, attendees, discounts, event_id } = req.body

            // Repository : Create event
            const result = await this.transactionRepository.createTransactionRepo(payment_method, attendees, discounts, event_id, userId)
            if (!result) throw { code: 500, message: "Something went wrong" }

            // Broadcast email
            const user = await this.customerRepository.findCustomerByIdRepo(userId)
            if (!user || !user.email || !user.username) throw { code: 404, message: "User not found" }
            await sendEmail(
                user.email, "Waiting for payment!",
                announcementEmailTemplate(
                    user.username,
                    result.amount > 0 ? `Hi ${user.username}, you've made a transaction for the event "${result.event.event_title}" with a total amount of Rp. ${result.amount.toLocaleString()}. Please complete the payment within 12 hours.`
                        : `Hi ${user.username}, your transaction for the event "${result.event.event_title}" was successful. Thank you for trusting us, and enjoy the event!`
                )
            )

            // Success response
            res.status(201).json({
                message: "Transaction created",
            })
        } catch (error: any) {
            next(error)
        }
    }

    public postUpdateTransactionEvidenceController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id from auth token
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Image upload
            let filePath: string
            if (req.file) { 
                const result = await cloudinaryUpload(req.file) 
                filePath = result.secure_url 
            } else {
                throw { code: 404, message: "File not found" }
            }

            // Request body
            const { transaction_id } = req.body

            // Repository : Update transaction by id
            const result = await this.transactionRepository.updateTransactionRepo(transaction_id, userId, filePath)
            if (!result) throw { code: 404, message: "Transaction not found" }
            await sendEmail(
                result.customer.email, "Payment successfull!",
                announcementEmailTemplate(
                    result.customer.username,
                    `Hi ${result.customer.username}, your transaction for the event "${result.event_title}" with a total amount of Rp. ${result.amount.toLocaleString()} is completed. Here is your ticket token: <b>${result.ticket_token}</b>`
                )
            )

            // Success response
            res.status(201).json({
                message: "Transaction evidence successfully upload",
            })
        } catch (error: any) {
            next(error)
        }
    }
}