import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class ReviewSeeder {
    private findRandomTransaction = async() => {
        const count = await prisma.transaction.count()
        if (count === 0) throw new Error('No transaction found. Seed transaction first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.transaction.findFirst({ skip, select: { id: true }})
    }

    public create = async () => {
        const transaction = await this.findRandomTransaction()

        return prisma.review.create({
            data: {
                transaction_id: transaction?.id!,
                review_body: faker.lorem.paragraph(),
                review_rate: faker.number.int({ min: 1, max: 5 }),
                created_at: faker.date.past({ years: 1 })
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default ReviewSeeder
