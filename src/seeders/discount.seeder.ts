import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { pointExpiredDays } from "../const"

class DiscountSeeder {
    private findRandomEventOrganiser = async() => {
        const whereClause = { social_medias: { none: {} } }
        const count = await prisma.event_organizer.count({
            where: whereClause
        })
        if (count === 0) throw new Error('No event organizer found. Seed event organizer first')
    
        const skip = Math.floor(Math.random() * count)
    
        return prisma.event_organizer.findFirst({ skip, where: whereClause, select: { id: true }})
    }

    public create = async () => {
        // Find random event organizer
        const isFromEventOrganizer = faker.datatype.boolean()
        const eventOrganizer = isFromEventOrganizer ? await this.findRandomEventOrganiser() : null
        const created_at = faker.date.between({
            from: new Date(Date.now() - pointExpiredDays * 24 * 60 * 60 * 1000),
            to: new Date(),
        })
        const expired_at = isFromEventOrganizer ? new Date(created_at.getTime() + pointExpiredDays * 24 * 60 * 60 * 1000) : null

        return prisma.discount.create({
            data: {
                event_organizer_id: eventOrganizer?.id ?? null,
                percentage: faker.number.int({ min: 5, max: 30 }),
                description: faker.lorem.sentence(),
                created_at,
                expired_at
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default DiscountSeeder
