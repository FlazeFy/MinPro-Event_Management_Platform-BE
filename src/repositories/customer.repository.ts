import { prisma } from '../configs/prisma'

export class CustomerRepository {
    public findCustomerByIdRepo = async (id: string) => {
        return await prisma.customer.findUnique({
            where: { id },
            select: {
                username: true, email: true, fullname: true, created_at: true, updated_at: true, phone_number: true, points: true,
                user_referral_code_histories: {
                    select: {
                        customer_user: {
                            select: { username: true }
                        }
                    }
                }
            }
        })
    }
}