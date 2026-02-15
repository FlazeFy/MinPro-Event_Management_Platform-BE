import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class AttendeeSeeder {
    private findRandomTransaction = async() => {
        const count = await prisma.transaction.count()
        if (count === 0) throw new Error('No transaction found. Seed transaction first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.transaction.findFirstOrThrow({ skip, select: { id: true }})
    }

    public create = async () => {
        const transaction = await this.findRandomTransaction()

        return prisma.attendee.create({
            data: {
                transaction_id: transaction.id,
                fullname: faker.person.fullName(),
                phone_number: faker.string.numeric('62##########'),
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default AttendeeSeeder
