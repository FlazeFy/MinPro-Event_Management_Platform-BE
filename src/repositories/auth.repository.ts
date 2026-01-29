import { compare } from "bcrypt"
import { prisma } from '../configs/prisma'
import { createToken } from "../utils/token.util"

export class AuthRepository {
    public loginRepository = async (email: string, password: string) => {
        // Repo : Check event_organizer first
        const event_organizer = await prisma.event_organizer.findUnique({
            where: { email }
        })

        if (event_organizer) {
            // Validate the password
            const validPassword = await compare(password, event_organizer.password)
            if (!validPassword) return null
    
            // Generate auth token
            const token = createToken({ id: event_organizer.id, role: "event_organizer" })
            return {
                name: event_organizer.organizer_name,
                email: event_organizer.email,
                role: "event_organizer",
                token,
            }
        }
    
        // Repo : Check customer if not event_organizer
        const customer = await prisma.customer.findUnique({
            where: { email }
        })

        if (customer) {
            // Validate the password
            const validPassword = await compare(password, customer.password)
            if (!validPassword) return null
    
            // Generate auth token
            const token = createToken({ id: customer.id, role: "customer" })
            return {
                name: customer.username,
                email: customer.email,
                role: "customer",
                token
            }
        }
    
        return null
    }
}