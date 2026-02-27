import { prisma } from '../configs/prisma'
import { extraDiscountForUser, extraPointForOwner, pointExpiredDays } from '../const'
import { generateRefferalCode, generateTier } from '../utils/generator.util'
import { createToken } from '../utils/token.util'

export class CustomerRepository {
    public findCustomerByIdRepo = async (id: string) => {
        // ORM
        const res = await prisma.customer.findUnique({
            where: { id },
            select: {
                username: true, email: true, fullname: true, created_at: true, updated_at: true, phone_number: true, birth_date: true, referral_code: true, profile_pic: true,
                owner_referral_code_histories: {
                    select: {
                        customer_user: {
                            select: { username: true, id: true, created_at: true }
                        }
                    }
                },
            }
        })

        // Check if customer has been use ref code
        const refCodeHistory = await prisma.referral_code_history.findFirst({
            where: { customer_user_id: id }
        })
        const is_use_ref_code = refCodeHistory ? true : false

        // Count total event's transaction
        const transaction = await prisma.transaction.count({
            where: { customer_id: id }
        })
        const tier = generateTier('customer', transaction)

        // Count points 
        const today = new Date()
        const totalPoints = await prisma.customer_point.aggregate({
            where: {
                customer_id: id,
                expired_at: { gte: today },
            },
            _sum: { point: true },
        })
        const points = totalPoints._sum.point ?? 0

        const finalRes = { ...res, total_transaction: transaction, tier, is_use_ref_code, points }

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

    public createCustomerRepo = async (username: string, email: string, password: string, fullname: string, phone_number: string, birth_date: string, profile_pic: string | null, referral_code: string) => {
        const ownReferralCode: string = generateRefferalCode()
        const customer = await prisma.customer.create({
            data: { username, email, password, fullname, phone_number, birth_date, profile_pic, referral_code: ownReferralCode }
        })

        // If user attached someone referall code
        let customer_point = {}
        let isExtraPoint = false
        if (referral_code) {
            // Find the ref's code owner
            const refCodeOwner = await prisma.customer.findFirst({ where: { referral_code: referral_code } })
            if (refCodeOwner) {
                // Create point for ref's code owner
                const created_at = new Date()
                const expired_at = new Date(created_at.getTime() + pointExpiredDays * 24 * 60 * 60 * 1000)

                customer_point = await prisma.customer_point.create({
                    data: { point: extraPointForOwner, created_at, expired_at, customer_id: refCodeOwner.id }
                })

                // Create discount for ref'code user
                const discount = await prisma.discount.create({
                    data: { customer_id: customer.id, percentage : extraDiscountForUser, description: 'Extra discount after referral code redeem' }
                })

                if (discount && customer_point) {
                    isExtraPoint = true
                    // Create ref code history
                    await prisma.referral_code_history.create({
                        data: { customer_owner_id: refCodeOwner.id, customer_user_id: customer.id }
                    })
                }
            }
        }
        
        // Generate auth token
        const token = createToken({ id: customer.id, role: "customer" }, "7d")

        return {
            name: customer.username,
            email: customer.email,
            role: "customer",
            token,
            is_extra_point: isExtraPoint
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