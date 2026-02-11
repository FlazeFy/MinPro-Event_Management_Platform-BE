import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

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

    public findAllEventOrganizerRepo = async (page: number, limit: number, search: string | null, eventOrganizerId: string | null) => {
        const skip = (page - 1) * limit
        const where: Prisma.event_organizerWhereInput = {
            ...(search && {
                organizer_name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
                bio: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
            })
        }

        const [data, total] = await Promise.all([
            prisma.event_organizer.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    organizer_name: 'desc'
                },
                select: {
                    id: true, email: true, organizer_name: true, phone_number: true, address: true, bio: true
                }
            }),
            prisma.event_organizer.count({
                where,
            }),
        ])

        return { data, total }
    }

    public findEventOrganizerDetailByIdRepo = async (id: string, page: number, limit: number, search: string | null, event_category: string | null, price_max: number | null, price_min: number | null) => {
        const skip = (page - 1) * limit
        const eventWhereClause: any = {
            event_organizer_id: id,
        }

        if (search) {
            eventWhereClause.OR = [
                { event_title: { contains: search, mode: "insensitive" } },
                { event_desc: { contains: search, mode: "insensitive" } },
            ]
        }
        if (event_category) eventWhereClause.event_category = event_category
        if (price_min !== null || price_max !== null) {
            eventWhereClause.event_price = {}
            if (price_min !== null) eventWhereClause.event_price.gte = price_min
            if (price_max !== null) eventWhereClause.event_price.lte = price_max
        }

        const [data, total] = await Promise.all([
            prisma.event_organizer.findMany({
                where: { id },
                select: {
                    organizer_name: true, email: true, address: true, phone_number: true, bio: true, created_at: true,
                    events: {
                        where: eventWhereClause,
                        skip,
                        take: limit,
                        select: {
                            event_title: true, event_desc: true, event_category: true, event_price: true, created_at: true
                        },
                        orderBy: [
                            { event_price: 'asc' },
                            { created_at: 'desc' }
                        ]
                    },
                }
            }),
            prisma.event.count({
                where: eventWhereClause,
            })
        ])

        return { data, total }
    }

    private findEventOrganizerById = async (id: string) => {
        return prisma.event_organizer.findUnique({
            where: { id },
            select: { id: true, organizer_name: true }
        })
    }
    public findTrendingEventOrganizerRepo = async () => {
        // Event organizer with most event
        const mostEvents = await prisma.event_organizer.findFirst({
            orderBy: {
                events: { _count: "desc" },
            },
            select: {
                id: true, organizer_name: true,
                _count: {
                    select: { events: true },
                },
            },
        })

        // Event organizer with most free event
        const mostFree = await prisma.event.groupBy({
            by: ["event_organizer_id"],
            where: { event_price: 0 },
            _count: { event_organizer_id: true },
            orderBy: {
                _count: { event_organizer_id: "desc" },
            },
            take: 1,
        })
        const mostFreeOrganizer = mostFree.length > 0 ? await this.findEventOrganizerById(mostFree[0].event_organizer_id) : null
      
        // Event organizer with highest event price average
        const highestAvg = await prisma.event.groupBy({
            by: ["event_organizer_id"],
            _avg: { event_price: true },
            orderBy: {
                _avg: { event_price: "desc" },
            },
            take: 1,
        })
        const highestAvgOrganizer = highestAvg.length > 0 ? await this.findEventOrganizerById(highestAvg[0].event_organizer_id) : null
      
        // Event organizer with lowest event price average
        const lowestAvg = await prisma.event.groupBy({
            by: ["event_organizer_id"],
            where: {
                event_price: { gt: 0 },
            },
            _avg: { event_price: true },
            orderBy: {
                _avg: { event_price: "asc" },
            },
            take: 1,
        })
        const lowestAvgOrganizer = lowestAvg.length > 0 ? await this.findEventOrganizerById(lowestAvg[0].event_organizer_id) : null
      
        return {
            most_events: mostEvents ? { id: mostEvents.id, organizer_name: mostEvents.organizer_name, value: mostEvents._count.events } : null,
            most_free_event: mostFreeOrganizer ? { ...mostFreeOrganizer, value: mostFree[0]._count.event_organizer_id } : null,
            highest_average_price: highestAvgOrganizer ? { ...highestAvgOrganizer, value: Math.round(highestAvg[0]._avg.event_price ?? 0) } : null,
            lowest_average_price: lowestAvgOrganizer ? { ...lowestAvgOrganizer, value: Math.round(lowestAvg[0]._avg.event_price ?? 0) } : null,
        }
    } 

    public checkUsernameOrEmailExistRepo = async (username: string, email: string) => {
        return await prisma.event_organizer.findFirst({
            where: {
                OR: [
                    { username }, { email },
                ],
            },
            select: {
                id: true, username: true, email: true,
            },
        })
    }

    public createEventOrganizerRepo = async (username: string, email: string, password: string, organizer_name: string, phone_number: string, bio: string, address: string) => {
        return await prisma.event_organizer.create({
            data: { username, email, password, organizer_name, phone_number, bio, address }
        })
    }
}