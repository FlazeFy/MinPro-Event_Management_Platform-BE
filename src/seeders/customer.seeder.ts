import { faker } from "@faker-js/faker"
import { prisma } from "../configs/prisma"
import { hashPassword } from "../utils/auth.util"
import { generateRefferalCode } from "../utils/generator.util"

class UserSeeder {
    public create = async (password: string) => {
        // Prepare dummy phone number
        const rawPhone = faker.phone.number()
        const phone_number = rawPhone.replace(/\D/g, "").slice(0, 16)

        return prisma.customer.create({
            data: {
                id: faker.string.uuid(),
                username: faker.internet.username(),
                email: faker.internet.email().toLowerCase(),
                fullname: faker.person.fullName(),
                password: await hashPassword(password), 
                phone_number: phone_number,
                referral_code: generateRefferalCode(),
                birth_date: faker.date.birthdate(),
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

export default UserSeeder
