import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"

class VenueSeeder {
    public create = async () => {
        return prisma.venue.create({
            data: {
                venue_name: `${faker.company.name()} ${faker.location.county()}`,
                venue_address: faker.location.streetAddress(),
                venue_coordinate: faker.location.nearbyGPSCoordinate().toString(),
                venue_description: faker.lorem.paragraph(),
                created_at: faker.date.past({ years: 3 })
            },
        })
    }

    public createMany = async (count: number) => {
        for (let i = 0; i < count; i++) {
            await this.create()
        }
    }
}

export default VenueSeeder
