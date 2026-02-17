import { NextFunction, Request, Response } from "express"
import { TransactionRepository } from "../repositories/transaction.repository"
import { extractUserFromAuthHeader } from "../utils/auth.util"

export class TransactionController {
    private transactionRepository: TransactionRepository

    constructor(){
        this.transactionRepository = new TransactionRepository()
    }

    public getAllTransactionController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
    
            // Repository : Get all transaction
            const result = await this.transactionRepository.findAllTransactionRepo(page, limit, search, userId)
            if (!result) throw { code: 404, message:  "Transaction not found" }
    
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
}