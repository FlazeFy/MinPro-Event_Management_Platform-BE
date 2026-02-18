import { compare } from "bcrypt"
import { prisma } from '../configs/prisma'
import { createToken } from "../utils/token.util"
import jwt from "jsonwebtoken"

export class AuthRepository {
    public loginRepo = async (email: string, password: string) => {
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
                name: event_organizer.username,
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

    public refreshTokenRepo = async (refreshToken: string) => {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.SECRET || "secret")
        if (typeof decoded === "string" || !("id" in decoded)) return null
        const id = decoded.id

        // Repo : Check event_organizer first
        const event_organizer = await prisma.event_organizer.findUnique({
            where: { id }
        })
        if (event_organizer) {
            // Generate auth token
            const token = createToken({ id: id, role: "event_organizer" }, "7d")
            return {
                name: event_organizer.username,
                email: event_organizer.email,
                role: "event_organizer",
                token,
            }
        }

        // Repo : Check customer if not event_organizer
        const customer = await prisma.customer.findUnique({
            where: { id }
        })
        if (customer) {
            // Generate auth token
            const token = createToken({ id: id, role: "customer" }, "7d")
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