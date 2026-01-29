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
}