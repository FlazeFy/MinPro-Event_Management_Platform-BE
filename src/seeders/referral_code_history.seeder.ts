import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class ReferralCodeHistorySeeder {
    private findRandomCustomerOwner = async () => {
        const owners = await prisma.customer.findMany({
            select: {
                id: true,
                owner_referral_code_histories: {
                    orderBy: { created_at: "desc" },
                    select: { customer_user_id: true, created_at: true },
                },
            },
        })      

        // Filter owners who can still have referrals (<3 uses, based on cooldown tho)
        const validOwners = owners.filter(o => {
            const histories = o.owner_referral_code_histories

            if (histories.length >= 3) return false
            if (histories.length > 0) {
                const lastUsage = histories[0].created_at
                const diffDays = (Date.now() - lastUsage.getTime()) / (1000 * 60 * 60 * 24)
                
                if (diffDays < 90) return false
            }

            return true
        })

        if (validOwners.length === 0) throw new Error("No valid referral owners found")

        // Pick random owner
        const randomOwner = validOwners[Math.floor(Math.random() * validOwners.length)]
        const usedUserIds = randomOwner.owner_referral_code_histories.map(h => h.customer_user_id)

        return { id: randomOwner.id, usedUserIds }
    }

    private findRandomCustomerUser = async (excludeIds: string[]) => {
        const users = await prisma.customer.findMany({
            where: {
                AND: [
                    { user_referral_code_histories: { none: {} } }, // never used
                    { NOT: { id: { in: excludeIds } } }, // not already used by this owner
                ],
            },
            select: { id: true },
        })

        if (users.length === 0) throw new Error("No valid referral users found")

        return users[Math.floor(Math.random() * users.length)]
    }

    public create = async () => {
        const owner = await this.findRandomCustomerOwner()

        // Randomize how many times this owner’s code will be used (0–3)
        const usageCount = Math.floor(Math.random() * 4)

        const createdHistories = []
        for (let i = 0; i < usageCount; i++) {
            const user = await this.findRandomCustomerUser(owner.usedUserIds)
            owner.usedUserIds.push(user.id) // track exclusions for next seed's iteration

            const history = await prisma.referral_code_history.create({
                data: {
                    customer_owner: { connect: { id: owner.id } },
                    customer_user: { connect: { id: user.id } },
                    created_at: faker.date.past({ years: 3 })
                },
            })

            createdHistories.push(history)
        }

        return createdHistories
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default ReferralCodeHistorySeeder
