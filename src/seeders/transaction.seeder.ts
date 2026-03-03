import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { TransactionStatus } from "../generated/prisma/enums"
import { generateRefferalCode, randomEnumValue } from "../utils/generator.util"

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

    private randomTransactionStatus = (): TransactionStatus => randomEnumValue(Object.values(TransactionStatus))

    public create = async () => {
        const customer = await this.findRandomCustomer()
        const event = await this.findRandomEvent()
        const paymentMethods = ['credit_card', 'debit_card', 'e_wallet', 'bank_transfer']
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        const status = this.randomTransactionStatus()

        const createdAt = faker.date.past({ years: 1 })

        let paid_off_at: Date | null = null

        if (status !== "pending") {
            const shouldHavePaidOffDate = faker.datatype.boolean()

            if (shouldHavePaidOffDate) {
                const maxMillis = 24 * 60 * 60 * 1000 // 24 hours
                const randomMillis = faker.number.int({ min: 1, max: maxMillis })

                paid_off_at = new Date(createdAt.getTime() + randomMillis)
            }
        }

        return prisma.transaction.create({
            data: {
                customer_id: customer?.id!,
                event_id: event?.id!,
                payment_method: paymentMethod,
                amount: faker.number.int({ min: 50_000, max: 2_000_000 }),
                status,
                paid_off_at,
                ticket_token: status !== "pending" ? generateRefferalCode() : null,
                transaction_pic: status !== "pending" ? faker.internet.url() : null,
                created_at: faker.date.past({ years: 1 })
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) await this.create()
    }
}

export default TransactionSeeder
