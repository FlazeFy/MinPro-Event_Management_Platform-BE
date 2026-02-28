import { prisma } from '../configs/prisma'
import { EventCategory, Prisma } from '../generated/prisma/client'

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

    public createEventRepo = async (eventOrganizerId: string, event_title: string, event_desc: string, event_category: EventCategory, event_price: number,
        is_paid: boolean, maximum_seat: number, venue_id: string, start_date: Date, end_date: Date, description?: string,
    ) => {
        // Set price to 0 if it's a free event
        const price = is_paid ? event_price : 0

        const newEvent = await prisma.$transaction(async (tx) => {
            // Create event first
            const event = await tx.event.create({
                data: {
                    event_organizer_id: eventOrganizerId,
                    event_title,
                    event_desc,
                    event_category,
                    event_price: price,
                    is_paid,
                    maximum_seat,
                },
            })

            // Continue by creating schedule for that event
            await tx.event_schedule.create({
                data: {
                    event_id: event.id,
                    venue_id,
                    start_date,
                    end_date,
                    description,
                },
            })

            return event
        })

        return newEvent
    }

    public findUpcomingEventRepo = async (userId: string, role: string) => {
        if (role === "customer") {
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
        } else {
            return await prisma.event_schedule.findMany({
                where: {
                    event: { event_organizer_id: userId }
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
                            id: true, event_title: true, event_category: true, maximum_seat: true,
                            transactions: {
                                select: {
                                    amount: true, paid_off_at: true, attendees: { select: { id: true } }
                                }
                            }
                        }
                    }
                }
            }).then(events => {
                // remaining calculaiton to find total profit and seat remaining
                return events.map(e => {
                    const totalProfit = e.event.transactions.filter(dt => dt.paid_off_at !== null).reduce((sum, idx) => sum + idx.amount, 0)
                    const totalAttendees = e.event.transactions.reduce((sum, idx) => sum + idx.attendees.length, 0)

                    return {
                        ...e, event: {
                            id: e.event.id,
                            event_title: e.event.event_title,
                            event_category: e.event.event_category,
                            maximum_seat: e.event.maximum_seat,
                            total_profit: totalProfit,
                            total_seat_remaining: e.event.maximum_seat - totalAttendees
                        }
                    }
                })
            })
        }
    }

    public findRecentEventByOrganizerRepo = async (eventOrganizerId: string, page: number, limit: number, search: string | null) => {
        const skip = (page - 1) * limit
        const now = new Date()
    
        const whereSchedule: Prisma.event_scheduleWhereInput = {
            end_date: { lt: now },
            event: { event_organizer_id: eventOrganizerId },
            ...(search && {
                OR: [
                    {
                        event: {
                            event_title: { contains: search, mode: 'insensitive' },
                        },
                    },
                    {
                        venue: {
                            venue_name: { contains: search, mode: 'insensitive' },
                        },
                    },
                ],
            }),
        }
    
        // ORM by event schedule
        const [groupedSchedules, totalGrouped] = await Promise.all([
            prisma.event_schedule.groupBy({
                by: ['event_id'],
                where: whereSchedule,
                _max: { end_date: true },
                orderBy: {
                    _max: { end_date: 'desc' },
                },
                skip,
                take: limit,
            }),
            prisma.event_schedule.groupBy({
                by: ['event_id'],
                where: whereSchedule,
            }),
        ])
    
        const eventIds = groupedSchedules.map((dt) => dt.event_id)
        if (!eventIds.length) return { data: [], total: totalGrouped.length }
    
        // Count total revenue
        const revenueAgg = await prisma.transaction.groupBy({
            by: ['event_id'],
            where: {
                event_id: { in: eventIds },
            },
            _sum: { amount: true },
        })
        const revenueMap = new Map(revenueAgg.map((dt) => [dt.event_id, dt._sum.amount ?? 0]))

        // Count total attendee
        const attendeeAgg = await prisma.attendee.findMany({
            where: {
                transaction: {
                    event_id: { in: eventIds },
                },
            },
            select: {
                transaction: {
                    select: { event_id: true },
                },
            },
        })
    
        // Count total booked seat
        const seatMap = new Map<string, number>()
        for (const dt of attendeeAgg) {
            const eventId = dt.transaction.event_id
            seatMap.set(eventId, (seatMap.get(eventId) ?? 0) + 1)
        }
    
        // ORM Event
        const events = await prisma.event.findMany({
            where: {
                id: { in: eventIds },
            },
            select: {
                id: true, event_title: true, event_desc: true, event_category: true, event_price: true, is_paid: true, maximum_seat: true, created_at: true,
                event_schedule: {
                    where: {
                        end_date: { lt: now },
                    },
                    orderBy: { end_date: 'desc' },
                    take: 1,
                    select: {
                        id: true, start_date: true, end_date: true,
                        venue: {
                            select: {
                                id: true, venue_name: true, venue_address: true,
                            },
                        },
                    },
                },
            },
        })

        const eventMap = new Map(events.map((dt) => [dt.id, dt]))
        const orderedData = eventIds.map((id) => {
            const event = eventMap.get(id)
            if (!event) return null

            return { ...event, total_revenue: revenueMap.get(id) ?? 0, total_booked_seat: seatMap.get(id) ?? 0 }
        }).filter(Boolean)
    
        return { data: orderedData, total: totalGrouped.length }
    }

    public findEventAttendeeByEventIdRepo = async (userId: string, eventId: string, page: number, limit: number, search: string | null) => {
        const skip = (page - 1) * limit 
        const where: Prisma.attendeeWhereInput = {
            transaction: {
                event_id: eventId, 
            },
            ...(search && {
                OR: [
                    {
                        fullname: {
                            contains: search, mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        transaction: {
                            customer: {
                                username: {
                                    contains: search, mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                    {
                        transaction: {
                            customer: {
                                fullname: {
                                    contains: search, mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                ],
            }),
        }
    
        const [data, total] = await Promise.all([
            prisma.attendee.findMany({
                where,
                skip,
                take: limit,
                select: {
                    fullname: true, phone_number: true, birth_date: true,
                    transaction: {
                        select: {
                            customer: {
                                select: {
                                    username: true, email: true, fullname: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    transaction: { created_at: 'desc' },
                },
            }),
            prisma.attendee.count({ where })
        ])
    
        return { data, total }
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
