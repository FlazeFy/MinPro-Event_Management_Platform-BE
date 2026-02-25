import { NextFunction, Request, Response } from "express"
import { CustomerRepository } from "../repositories/customer.repository"
import { announcementEmailTemplate } from "../templates/announcement.template"
import { extractUserFromAuthHeader, hashPassword } from "../utils/auth.util"
import { sendEmail } from "../utils/mailer.util"
import { ReferralCodeRepository } from "../repositories/referral_code.repository"
import { extraPointForOwner } from "../const"

export class ReferralCodeController {
    private refCodeRepository: ReferralCodeRepository
    private customerRepository: CustomerRepository

    constructor(){
        this.refCodeRepository = new ReferralCodeRepository()
        this.customerRepository = new CustomerRepository()
    }

    public postUseRefCodeController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Body
            const { referral_code } = req.body

            // Get user id
            const { userId } = extractUserFromAuthHeader(req.headers.authorization)

            // Repo : Get my profile
            const myProfile = await this.customerRepository.findCustomerByIdRepo(userId)

            // Repo : Check avaibility
            const isUsed = await this.refCodeRepository.findRefCodeCustomerUserByCustomerIdRepo(userId, referral_code)
            if (isUsed) throw { code: 409, message: "You can't only use referral code once" }

            // Repo : Create ref code history
            const result = await this.refCodeRepository.createReferralCodeRepo(userId, referral_code, myProfile)

            // Broadcast email
            await sendEmail(
                result.email, "Referral Redeem!",
                announcementEmailTemplate(
                    result.username,
                    `Your referral code has been redeemed by ${myProfile.username}. Thank you for helping us invite others to join our platform. As a reward, we are giving you an extra ${extraPointForOwner} points`
                )
            )
            
            // Success response
            return res.status(201).json({
                message: "Referral code redeem successful"
            })
        } catch (error: any) {
            next(error)
        }
    }
}