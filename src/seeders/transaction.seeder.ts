import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class TransactionSeeder {
    private findRandomCustomer = async() => {
        const count = await prisma.customer.count()
        if (count === 0) throw new Error('No customer found. Seed customer first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.customer.findFirst({ skip, select: { id: true }})
    }

    private findRandomEvent = async() => {
        const count = await prisma.event.count()
        if (count === 0) throw new Error('No event found. Seed event first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.event.findFirst({ skip, select: { id: true }})
    }

    public create = async () => {
        const customer = await this.findRandomCustomer()
        const event = await this.findRandomEvent()
        const paymentMethods = ['credit_card', 'debit_card', 'e_wallet', 'bank_transfer']
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

        return prisma.transaction.create({
            data: {
                customer_id: customer?.id!,
                event_id: event?.id!,
                payment_method: paymentMethod,
                amount: faker.number.int({ min: 50_000, max: 2_000_000 }),
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

export default TransactionSeeder
