import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class FeedbackSeeder {
    public create = async () => {
        return prisma.feedback.create({
            data: {
                id: faker.string.uuid(),
                feedback_rate: faker.number.int({ min: 1, max: 5 }),
                feedback_body: faker.lorem.sentence(),
                created_at: faker.date.past({ years: 1 }),
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default FeedbackSeeder
