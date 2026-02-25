import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'
import { generateTier } from '../utils/generator.util'
import { createToken } from '../utils/token.util'

export class EventOrganizerRepository {
    public findEventOrganizerByIdRepo = async (id: string) => {
        const res = await prisma.event_organizer.findUnique({
            where: { id },
            select: {
                username: true, email: true, organizer_name: true, bio: true, created_at: true, updated_at: true, phone_number: true, address: true, profile_pic: true,
                social_medias: {
                    omit: {
                        id: true, event_organizer_id: true
                    }
                }
            },
        })

        // Count total event's attendee
        const attendee = await prisma.attendee.count({
            where: {
                transaction: {
                    event: { event_organizer_id: id }
                }
            }
        })
        const tier = generateTier('event_organizer', attendee)
        const finalRes = { ...res, total_attendee: attendee, tier }

        return finalRes
    }

    public findNewComerEventOrganizerRepo = async (page: number, limit: number, search: string | null) => {
        const skip = (page - 1) * limit
        const where: Prisma.event_organizerWhereInput = {
            ...(search && {
                OR: [
                    {
                        organizer_name: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        }
                    },
                    {
                        bio: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    }
                ]
            })
        }

        const [data, total] = await Promise.all([
            prisma.event_organizer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true, organizer_name: true, bio: true, created_at: true, profile_pic: true, 
                    _count: { 
                        select: { events: true }
                    },
                    events: {
                        select: {
                            transactions: {
                                select: { attendees: true }
                            }
                        }
                    }
                }
            }),
            prisma.event_organizer.count({ where }),
        ])

        const finalRes = data.map((dt) => {
            const totalAttendees = dt.events.reduce((dtSum, idx) => dtSum + idx.transactions.reduce((dtSumPerTs, idxTs) => dtSumPerTs + idxTs.attendees.length, 0), 0)
            
            return { 
                id: dt.id, 
                organizer_name: dt.organizer_name, 
                bio: dt.bio, 
                created_at: dt.created_at, 
                profile_pic: dt.profile_pic, 
                total_event: dt._count.events, 
                total_attendee: totalAttendees,
            }
        })

        return { data: finalRes, total }
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

    public updateEventOrganizerByIdRepo = async (userId: string, username: string, email: string, organizer_name: string, phone_number: string, address?: string, bio?: string) => {
        await this.checkUniqueEventOrganizer(userId, username, email, phone_number, organizer_name)

        return prisma.event_organizer.update({
            where: { id: userId },
            data: { username, email, organizer_name, phone_number, address, bio }
        })
    }

    public findAllEventOrganizerRepo = async (page: number, limit: number, search: string | null) => {
        const skip = (page - 1) * limit
        const where: Prisma.event_organizerWhereInput = {
            ...(search && {
                OR: [
                    {
                        organizer_name: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        }
                    },
                    {
                        bio: {
                            contains: search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    }
                ]
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
            prisma.event_organizer.count({ where }),
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
            prisma.event.count({ where: eventWhereClause })
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

    public createEventOrganizerRepo = async (username: string, email: string, password: string, organizer_name: string, phone_number: string, bio: string, address: string, profile_pic: string | null) => {
        const event_organizer = await prisma.event_organizer.create({
            data: { username, email, password, organizer_name, phone_number, bio, address, profile_pic }
        })

        // Generate auth token
        const token = createToken({ id: event_organizer.id, role: "event_organizer" }, "7d")
        return {
            name: event_organizer.username,
            email: event_organizer.email,
            role: "event_organizer",
            token,
        }
    }

    // Stats
    public findEventOrganizerSummaryById = async (id: string) => {
        const now = new Date()

        // Find the nearest event
        const upcomingEvent = await prisma.event_schedule.findFirst({
            where: {
                event: { event_organizer_id: id },
                start_date: { gte: now },
            },
            orderBy: { start_date: "asc" },
            include: {
                event: {
                    select: { event_title: true }
                },
            },
        })

        // Count total transaction
        const totalTransaction = await prisma.transaction.count({
            where: {
                event: { event_organizer_id: id },
            }
        })

        // Count total attendee that registered in each transaction
        const totalAttendee = await prisma.attendee.count({
            where: {
                transaction: {
                    event: { event_organizer_id: id }
                }
            }
        })

        // Sum of transaction amounts (final after discount)
        const totalActualRevenueAgg = await prisma.transaction.aggregate({
            where: {
                event: { event_organizer_id: id },
            },
            _sum: { amount: true },
        })
        const totalActualRevenue = totalActualRevenueAgg._sum.amount ?? 0
        
        // Reconstruct original revenue before discounts
        const transactions = await prisma.transaction.findMany({
            where: {
                event: { event_organizer_id: id },
            },
            include: {
                used_discounts: {
                    include: { discount: true }
                }
            }
        })
        
        let totalRevenue = 0
        for (const tx of transactions) {
            // Start from final amount
            let discountMultiplier = 1
            for (const ud of tx.used_discounts) {
                discountMultiplier *= (1 - ud.discount.percentage / 100)
            }
            
            const originalAmount = tx.amount / discountMultiplier
            totalRevenue += originalAmount
        }
        
        // Average review rating
        const averageReviewRateAgg = await prisma.review.aggregate({
            where: {
                transaction: {
                    event: { event_organizer_id: id }
                }
            },
            _avg: { review_rate: true }
        })
        const averageReviewRate = averageReviewRateAgg._avg.review_rate ?? 0
        
        return {
            upcoming_event: upcomingEvent?.event.event_title ?? null,
            total_transaction: totalTransaction,
            total_attendee: totalAttendee,
            total_revenue: Number(totalRevenue.toFixed(2)),
            total_actual_revenue: Number(totalActualRevenue.toFixed(2)),
            average_review_rate: averageReviewRate,
        }
    }

    public updateEventOrganizerProfileImageByIdRepo = async(userId: string, profile_pic: string | null) => {        
        return prisma.event_organizer.update({
            where: { id: userId },
            data: { profile_pic }
        })
    }
}
  