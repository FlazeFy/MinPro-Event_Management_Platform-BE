import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class FeedbackSeeder {
    private findRandomCustomerWithoutFeedback = async () => {
        const customers = await prisma.customer.findMany({
            where: { feedback: { none: {} } },
            select: { id: true }
        })

        if (!customers.length) return null

        const randomIndex = Math.floor(Math.random() * customers.length)
        return customers[randomIndex].id
    }

    private findRandomEventOrganizerWithoutFeedback = async () => {
        const organizers = await prisma.event_organizer.findMany({
            where: { feedback: { none: {} } },
            select: { id: true }
        })

        if (!organizers.length) return null

        const randomIndex = Math.floor(Math.random() * organizers.length)
        return organizers[randomIndex].id
    }

    public create = async () => {
        const isCustomer = faker.datatype.boolean()
        const customerId = isCustomer ? await this.findRandomCustomerWithoutFeedback() : null
        const organizerId = !isCustomer ? await this.findRandomEventOrganizerWithoutFeedback() : null
        if (isCustomer && !customerId) return null
        if (!isCustomer && !organizerId) return null

        return prisma.feedback.create({
            data: {
                id: faker.string.uuid(),
                feedback_rate: faker.number.int({ min: 1, max: 5 }),
                feedback_body: faker.lorem.sentence(),
                created_at: faker.date.past({ years: 1 }),
                customer_id: customerId,
                event_organizer_id: organizerId
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
