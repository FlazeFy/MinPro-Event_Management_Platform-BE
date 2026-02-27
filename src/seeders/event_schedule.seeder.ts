import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class EventScheduleSeeder {
    private findRandomEventNoSchedule = async() => {
        const where = { event_schedule: { none: {} } }
        const count = await prisma.event.count({where})
        if (count === 0) throw new Error('No event found. Seed event first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.event.findFirst({ skip, where, select: { id: true }})
    }

    private findRandomVenue = async() => {
        const count = await prisma.venue.count()
        if (count === 0) throw new Error('No venue found. Seed venue first')
    
        const skip = Math.floor(Math.random() * count)
        return prisma.venue.findFirst({ skip, select: { id: true }})
    }

    public create = async () => {
        const event = await this.findRandomEventNoSchedule()
        const venue = await this.findRandomVenue()
        const startDate = faker.date.between({
            from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        })
        const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours after start

        return prisma.event_schedule.create({
            data: {
                event: {
                    connect: { id: event?.id }
                },
                venue: {
                    connect: { id: venue?.id }
                },
                description: faker.lorem.sentence(2),
                start_date: startDate,
                end_date: endDate,
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default EventScheduleSeeder
