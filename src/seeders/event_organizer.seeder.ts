import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { hashPassword } from "../utils/auth.util"

class EventOrganizerSeeder {
    public create = async (password: string) => {
        // Prepare dummy phone number
        const rawPhone = faker.phone.number()
        const phone_number = rawPhone.replace(/\D/g, "").slice(0, 16)

        return prisma.event_organizer.create({
            data: {
                id: faker.string.uuid(),
                username: faker.internet.username(),
                email: faker.internet.email().toLowerCase(),
                organizer_name: faker.company.name(),
                bio: faker.lorem.paragraph(),
                password: await hashPassword(password), 
                phone_number: phone_number,
                address: faker.location.streetAddress(),
                created_at: faker.date.past({ years: 3 }),
            },
        })
    }

    public createMany = async (count: number, password: string) => {
        for (let i = 0; i < count; i++) {
            await this.create(password)
        }
    }
}

export default EventOrganizerSeeder
