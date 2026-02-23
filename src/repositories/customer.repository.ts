import { prisma } from '../configs/prisma'
import { generateTier } from '../utils/generator.util'
import { createToken } from '../utils/token.util'

export class CustomerRepository {
    public findCustomerByIdRepo = async (id: string) => {
        const res = await prisma.customer.findUnique({
            where: { id },
            select: {
                username: true, email: true, fullname: true, created_at: true, updated_at: true, phone_number: true, points: true, birth_date: true, referral_code: true, profile_pic: true,
                owner_referral_code_histories: {
                    select: {
                        customer_user: {
                            select: { username: true, id: true, created_at: true }
                        }
                    }
                },
            }
        })

        // Count total event's transaction
        const transaction = await prisma.transaction.count({
            where: { customer_id: id }
        })
        const tier = generateTier('customer', transaction)
        const finalRes = { ...res, total_transaction: transaction, tier }

        return finalRes
    }

    public checkUsernameOrEmailExistRepo = async (username: string, email: string) => {
        return await prisma.customer.findFirst({
            where: {
                OR: [ { username }, { email } ],
            },
            select: {
                id: true, username: true, email: true,
            },
        })
    }

    public createCustomerRepo = async (username: string, email: string, password: string, fullname: string, phone_number: string, birth_date: string, profile_pic: string | null) => {
        const customer = await prisma.customer.create({
            data: { username, email, password, fullname, phone_number, birth_date, profile_pic }
        })
        
        // Generate auth token
        const token = createToken({ id: customer.id, role: "customer" }, "7d")
        return {
            name: customer.username,
            email: customer.email,
            role: "customer",
            token,
        }
    }

    public checkUniqueCustomer = async (userId: string, username?: string, email?: string, phone_number?: string) => {
        const exists = await prisma.customer.findFirst({
            where: {
                OR: [
                    username ? { username, NOT: { id: userId } } : {},
                    email ? { email, NOT: { id: userId } } : {},
                    phone_number ? { phone_number, NOT: { id: userId } } : {}
                ]
            }
        })

        if (exists) throw { code: 409, message: "Duplicate field found" }
    }
    
    public updateCustomerByIdRepo = async(userId: string, username: string, email: string, fullname: string, phone_number: string, birth_date: Date) => {
        await this.checkUniqueCustomer(userId, username, email, phone_number)
        
        return prisma.customer.update({
            where: { id: userId },
            data: { username, email, fullname, phone_number, birth_date }
        })
    }

    public updateCustomerProfileImageByIdRepo = async(userId: string, profile_pic: string | null) => {        
        return prisma.customer.update({
            where: { id: userId },
            data: { profile_pic }
        })
    }
}