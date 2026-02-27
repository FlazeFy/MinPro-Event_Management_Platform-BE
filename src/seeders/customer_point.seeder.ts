import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { pointExpiredDays } from "../const"

class CustomerPointSeeder {
    private findRandomCustomerWithoutPoint = async () => {
        const customersWithoutPoint = await prisma.customer.findMany({
            where: {
                customer_points: { none: {} }
            },
            select: { id: true }
        })

        if (customersWithoutPoint.length === 0) throw new Error('No customer found. Seed customer first')

        const randomIndex = Math.floor(Math.random() * customersWithoutPoint.length)
        return customersWithoutPoint[randomIndex]
    }

    public create = async () => {
        const customer = await this.findRandomCustomerWithoutPoint()
        const createdAt = faker.date.past({ years: 3 }) 
        const expiredAt = new Date(createdAt.getTime() + pointExpiredDays * 24 * 60 * 60 * 1000)

        return prisma.customer_point.create({
            data: {
                point: 10000,
                customer_id: customer?.id!,
                created_at: createdAt, 
                expired_at: expiredAt,
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default CustomerPointSeeder