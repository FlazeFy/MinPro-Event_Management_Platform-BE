import { prisma } from '../configs/prisma'

export class EventOrganizerRepository {
    public findEventOrganizerByIdRepo = async (id: string) => {
        return await prisma.event_organizer.findUnique({
            where: { id }
        })
    }
}