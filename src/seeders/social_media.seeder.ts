import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { SocialMediaPlatform } from "../generated/prisma/enums"
import { randomEnumValue } from "../utils/generator.util"

class SocialMediaSeeder {
    private randomSocialMediaPlatform = (): SocialMediaPlatform => {
        return randomEnumValue(Object.values(SocialMediaPlatform))
    }

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
        const eventOrganizer = await this.findRandomEventOrganiser()
        if (!eventOrganizer) throw new Error('No event organizer found. Seed event organizer first')

        return prisma.social_media.create({
            data: {
                event_organizer: { connect: { id: eventOrganizer.id } },
                social_media_platform: this.randomSocialMediaPlatform(),
                social_media_url: faker.internet.url(),
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default SocialMediaSeeder
