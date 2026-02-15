import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class UsedDiscountSeeder {
    private findRandomTransaction = async() => {
        const count = await prisma.transaction.count()
        if (count === 0) throw new Error('No transaction found. Seed transaction first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.transaction.findFirstOrThrow({ skip, select: { id: true }})
    }

    private findRandomDiscount = async() => {
        const count = await prisma.discount.count()
        if (count === 0) throw new Error('No discount found. Seed discount first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.discount.findFirstOrThrow({ skip, select: { id: true }})
    }

    public create = async () => {
        const transaction = await this.findRandomTransaction()
        const discount = await this.findRandomDiscount()

        return prisma.used_discount.create({
            data: {
                transaction_id: transaction.id,
                discount_id: discount.id,
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default UsedDiscountSeeder
