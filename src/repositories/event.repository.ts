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
) => {
    // Set price to 0 if it's a free event
    const price = is_paid ? event_price : 0;    
    // Create the new event record
    const newEvent = await prisma.event.create({
        data: {
            event_organizer_id: eventOrganizerId,
            event_title,  // using shorthand property names
            event_desc,
            event_category,
            event_price: price,
            is_paid,
            maximum_seat,
        },
    });
    return newEvent;
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
                    }
                )
            })
        }
    }

    public findEventByOrganizerIdRepo = async (eventOrganizerId: string, limit: number) => {
        // Petunjuk: endpoint ini mengambil daftar event berdasarkan `event_organizer_id`.
        // `limit` bisa diatur dari query params di controller untuk membatasi jumlah data.
        const events = await prisma.event.findMany({
            where: {
                event_organizer_id: eventOrganizerId,
            },
            orderBy: {
                created_at: 'desc',
            },
            take: limit,
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
                    orderBy: {
                        start_date: 'asc'
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

        return events
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
