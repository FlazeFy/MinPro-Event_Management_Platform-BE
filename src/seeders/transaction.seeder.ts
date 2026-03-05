import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { TransactionStatus } from "../generated/prisma/enums"
import { generateRefferalCode, getTransactionCode, randomEnumValue } from "../utils/generator.util"

class TransactionSeeder {
    private findRandomCustomer = async() => {
        const count = await prisma.customer.count()
        if (count === 0) throw new Error('No customer found. Seed customer first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.customer.findFirst({ skip, select: { id: true }})
    }

    private findRandomDiscount = async(event_organizer_id: string) => {
        const count = await prisma.discount.count({ where: { event_organizer_id } })
        if (count === 0) return null
    
        const skip = Math.floor(Math.random() * count)
        return prisma.discount.findFirst({ 
            skip, 
            select: { id: true, percentage: true },
            where: { event_organizer_id }
        })
    }

    private findRandomEvent = async() => {
        const count = await prisma.event.count()
        if (count === 0) throw new Error('No event found. Seed event first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.event.findFirst({ skip, select: { id: true, is_paid: true, event_price: true, event_organizer_id: true }})
    }

    private randomTransactionStatus = (): TransactionStatus => randomEnumValue(Object.values(TransactionStatus))

    public create = async () => {
        const customer = await this.findRandomCustomer()
        const event = await this.findRandomEvent()
        if (!event) throw new Error('No event found. Seed event first')

        const paymentMethods = ['credit_card', 'debit_card', 'e_wallet', 'bank_transfer']

        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        let status = event?.is_paid ? this.randomTransactionStatus() : "paid"
        const createdAt = faker.date.past({ years: 1 })
        let paid_off_at: Date | null = null
        let randomTotalAttendee: number = faker.number.int({ min: 1, max: 10 })
        let real_amount: number = event?.is_paid ? event.event_price : 0
        let discount_cut: number = 0
        let point_cut: number = 0
        let final_amount: number = real_amount
        let discount = null

        if (status !== "pending") {
            const shouldHavePaidOffDate = faker.datatype.boolean()

            if (shouldHavePaidOffDate && event?.is_paid) {
                const maxMillis = 24 * 60 * 60 * 1000 // 24 hours
                const randomMillis = faker.number.int({ min: 1, max: maxMillis })

                paid_off_at = new Date(createdAt.getTime() + randomMillis)
            } else {
                paid_off_at = createdAt
            }
        } 

        if (event?.is_paid) {
            const isUsedDiscount: boolean = faker.datatype.boolean() 

            if (isUsedDiscount) { 
                // Decide if transaction use point
                const isUsedPoint: boolean = faker.datatype.boolean() 
                if (isUsedPoint) {
                    point_cut = faker.number.int({ min: 50, max: 10000 })
                    final_amount = final_amount - point_cut
                }

                // If discount found, just use it
                discount = await this.findRandomDiscount(event.event_organizer_id)
                if (discount) {
                    discount_cut = final_amount * discount.percentage / 100
                    final_amount = final_amount - discount_cut
                }
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                transaction_code: getTransactionCode(event?.id),
                customer_id: customer?.id!,
                event_id: event?.id!,
                payment_method: paymentMethod,
                status,
                real_amount,
                final_amount,
                discount_cut,
                point_cut,
                paid_off_at,
                ticket_token: status !== "pending" ? generateRefferalCode() : null,
                transaction_pic: status !== "pending" ? faker.internet.url() : null,
                created_at: faker.date.past({ years: 1 })
            },
        })

        if (discount_cut > 0 && discount) {
            await prisma.used_discount.create({
                data: {
                    transaction_id: transaction.id,
                    discount_id: discount.id,
                }
            })
        }

        for(let i = 0; i < randomTotalAttendee; i++){
            await prisma.attendee.create({
                data: {
                    transaction_id: transaction.id,
                    fullname: faker.person.fullName(),
                    phone_number: faker.string.numeric('62##########'),
                    birth_date: faker.date.birthdate(),
                },
            })
        }
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) await this.create()
    }
}

export default TransactionSeeder
