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

    public createEventRepo = async (
        eventOrganizerId: string,
        event_title: string,
        event_desc: string,
        event_category: EventCategory,
        event_price: number,
        is_paid: boolean,
        maximum_seat: number,
        venue_id: string,
        start_date: Date,
        end_date: Date,
        description?: string,
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

    public findRecentEventByOrganizerRepo = async (eventOrganizerId: string, page: number, limit: number) => {
        // Petunjuk: endpoint ini mengambil event yang sudah selesai milik organizer yang login.
        // Urutan data berdasarkan jadwal yang paling baru selesai (end_date terbaru).
        const skip = (page - 1) * limit
        const now = new Date()
        const whereSchedule: Prisma.event_scheduleWhereInput = {
            end_date: { lt: now },
            event: { event_organizer_id: eventOrganizerId },
        }

        const [groupedSchedules, allGroupedSchedules] = await Promise.all([
            prisma.event_schedule.groupBy({
                by: ['event_id'],
                where: whereSchedule,
                _max: { end_date: true },
                orderBy: { _max: { end_date: 'desc' } },
                skip,
                take: limit,
            }),
            prisma.event_schedule.groupBy({
                by: ['event_id'],
                where: whereSchedule,
            }),
        ])

        const eventIds = groupedSchedules.map((dt) => dt.event_id)
        if (eventIds.length === 0) return { data: [], total: allGroupedSchedules.length }

        const events = await prisma.event.findMany({
            where: { id: { in: eventIds } },
            select: {
                id: true,
                event_title: true,
                event_desc: true,
                event_category: true,
                event_price: true,
                is_paid: true,
                maximum_seat: true,
                created_at: true,
                event_organizer: {
                    select: {
                        id: true,
                        organizer_name: true,
                    },
                },
                event_schedule: {
                    where: { end_date: { lt: now } },
                    orderBy: {
                        end_date: 'desc',
                    },
                    take: 1,
                    select: {
                        id: true,
                        start_date: true,
                        end_date: true,
                        venue: {
                            select: {
                                id: true,
                                venue_name: true,
                                venue_address: true,
                            },
                        },
                    },
                },
            },
        })

        // Jaga urutan sesuai hasil groupedSchedules (paling baru selesai -> paling lama selesai).
        const eventMap = new Map(events.map((dt) => [dt.id, dt]))
        const orderedData = eventIds.map((id) => eventMap.get(id)).filter(Boolean)

        return { data: orderedData, total: allGroupedSchedules.length }
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
