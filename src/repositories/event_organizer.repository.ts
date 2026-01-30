import { prisma } from '../configs/prisma'

export class EventOrganizerRepository {
    public findEventOrganizerByIdRepo = async (id: string) => {
        return await prisma.event_organizer.findUnique({
            where: { id },
            select: {
                username: true, email: true, organizer_name: true, bio: true, created_at: true, updated_at: true, phone_number: true, address: true,
                social_medias: {
                    omit: {
                        id: true, event_organizer_id: true
                    }
                }
            },
        })
    }

    private checkUniqueEventOrganizer = async (userId: string, username?: string, email?: string, phone_number?: string, organizer_name?: string) => {
        const exists = await prisma.event_organizer.findFirst({
            where: {
                OR: [
                    username ? { username, NOT: { id: userId } } : {},
                    email ? { email, NOT: { id: userId } } : {},
                    phone_number ? { phone_number, NOT: { id: userId } } : {},
                    organizer_name ? { organizer_name, NOT: { id: userId } } : {}
                ]
            }
        })

        if (exists) throw { code: 409, message: "Duplicate field found" }
    }

    public updateEventOrganizerByIdRepo = async (userId: string, username: string, email: string, organizer_name: string, phone_number: string, address?: string) => {
        await this.checkUniqueEventOrganizer(userId, username, email, phone_number, organizer_name)
        
        return prisma.event_organizer.update({
            where: { id: userId },
            data: { username, email, organizer_name, phone_number, address }
        })
    }
}