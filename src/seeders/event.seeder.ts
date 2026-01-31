import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { hashPassword } from "../utils/auth.util"
import { generateRefferalCode, randomEnumValue } from "../utils/generator.util"
import { EventCategory } from "../generated/prisma/enums"

class EventSeeder {
    private randomEventCategory = (): EventCategory => {
        return randomEnumValue(Object.values(EventCategory))
    }

    private findRandomEventOrganiser = async() => {
        const count = await prisma.event_organizer.count()
        if (count === 0) throw new Error('No event organizer found. Seed event organizer first')
    
        const skip = Math.floor(Math.random() * count)
    
        return prisma.event_organizer.findFirst({ skip, select: { id: true }})
    }

    public create = async () => {
        const is_paid = faker.datatype.boolean()
        // Find random event organizer
        const eventOrganizer = await this.findRandomEventOrganiser() 

        return prisma.event.create({
            data: {
                event_organizer: {
                    connect: { id: eventOrganizer?.id }
                },
                event_title: faker.music.songName(),
                event_desc: faker.lorem.paragraph(),
                event_category: this.randomEventCategory(),
                event_price: is_paid ? BigInt(faker.number.int({ min: 50_000, max: 2_000_000 })) : 0,
                is_paid,
                maximum_seat: faker.number.int({ min: 100, max: 2_000 }),
                created_at: faker.date.past({ years: 3 }),
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default EventSeeder