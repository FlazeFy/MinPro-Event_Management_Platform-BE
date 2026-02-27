import { prisma } from '../configs/prisma'
import { extraDiscountForUser, extraPointForOwner, pointExpiredDays } from '../const'

export class ReferralCodeRepository {
    public createReferralCodeRepo = async (userId: string, refCode: string, myData: any) => {
        // Find the ref code's owner
        const user = await prisma.customer.findFirst({
            where: { referral_code: refCode }
        })
        if (!user) throw { code: 404, message: "Referral code is not valid" }

        // Create ref code history
        await prisma.referral_code_history.create({
            data: { customer_owner_id: user?.id, customer_user_id: userId }
        })

        // Create point for ref's code owner
        const created_at = new Date()
        const expired_at = new Date(created_at.getTime() + pointExpiredDays * 24 * 60 * 60 * 1000)
        await prisma.customer_point.create({
            data: { point: extraPointForOwner, created_at, expired_at, customer_id: user.id }
        })

        // Create discount for ref's code user
        await prisma.discount.create({
            data: { customer_id: userId, percentage : extraDiscountForUser, description: 'Extra discount after referral code redeem' }
        })

        return user
    }

    public findRefCodeCustomerUserByCustomerIdRepo = async (userId: string, referral_code: string) => {
        // Find if the ref code is valid
        const isValid = await prisma.customer.findFirst({
            where: { referral_code, id: { not: userId } }
        })
        if (!isValid) throw { code: 404, message: "Referral code is not valid" }

        // Find total used
        const useds = await prisma.referral_code_history.findMany({
            where: { customer_owner_id: isValid.id }
        })
        if (useds.length === 3) throw { code: 409, message: "Referral code has already been redeemed 3 times" }

        // Check if customer make first ref code redeem
        return await prisma.referral_code_history.findFirst({
            where: { customer_user_id: userId }
        })
    }
}
  