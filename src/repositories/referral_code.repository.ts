import { prisma } from '../configs/prisma'
import { extraPointForOwner, extraPointForUser } from '../const'

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

        // Update ref code's owner points (achievment)
        await prisma.customer.update({
            where: { id: user.id },
            data: { points: user.points + extraPointForOwner }
        })

        // Update ref code's user points (achievment)
        await prisma.customer.update({
            where: { id: userId },
            data: { points: myData.points + extraPointForUser }
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
  