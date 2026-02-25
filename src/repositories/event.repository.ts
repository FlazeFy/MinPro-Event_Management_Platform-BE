import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

export class EventRepository {
    public findAllEventRepo = async (page: number, limit: number, search: string | null, eventOrganizerId: string | null) => {
        const skip = (page - 1) * limit
        const where: Prisma.eventWhereInput = {
            ...(search && {
                event_title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
            }),
            ...(eventOrganizerId !== null && {
                event_organizer_id: eventOrganizerId,
            }),
        }

        const [data, total] = await Promise.all([
            prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc'
                },
            }),
            prisma.event.count({ where }),
        ])

        return { data, total }
    }

    public findUpcomingEventRepo = async (userId: string, role: string) => {
        return await prisma.event_schedule.findMany({
            where: {
                event: {
                    transactions: {
                        some: { customer_id: userId }
                    }
                }
            },
            orderBy: { start_date: 'desc' },
            take: 3,
            select: {
                start_date: true, end_date: true,
                venue: {
                    select: {
                        venue_name: true, venue_address: true, venue_coordinate: true,
                    },
                },
                event: {
                    select: {
                        id: true, event_title: true, event_category: true,
                        transactions: {
                            where: { customer_id: userId },
                            select: {
                                attendees: { select: { fullname: true } }
                            }
                        }
                    }
                }
            }
        })
    }

    public deleteEventByIdRepo = async (userId: string, eventId: string) => {
        try {
            return await prisma.event.delete({
                where: { id: eventId, event_organizer_id: userId }
            })
        } catch (error: any) {
            if (error.code === "P2025") return null
            throw error
        }
    } 
}
  