import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'
import { format } from "date-fns"

export class TransactionRepository {
    public findEventPeriodicRevenueByOrganizerId = async (eventOrganizerId: string) => {
        // Fetching
        const transactions = await prisma.transaction.findMany({
            select: { 
                amount: true, created_at: true,
                event: { 
                    select: { event_category: true } 
                }
            },
            where: { 
                event: { event_organizer_id: eventOrganizerId } 
            },
        })

        // Group by month/year
        const monthlyData: Record<string, Record<string, number>> = {}

        for (const dt of transactions) {
            const monthLabel = format(dt.created_at, "MMM yyyy") 
            const category = dt.event.event_category

            if (!monthlyData[monthLabel]) monthlyData[monthLabel] = {}
            if (!monthlyData[monthLabel][category]) monthlyData[monthLabel][category] = 0

            monthlyData[monthLabel][category] += dt.amount
        }

        // Sort month descending to take last 7
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7).reverse()

        // Make categories as label
        const categories = Array.from(new Set(transactions.map(dt => dt.event.event_category)))

        const datasets = categories.map(category => ({
            label: category,
            data: sortedMonths.map(month => monthlyData[month][category] ?? 0),
        }))

        return { labels: sortedMonths, datasets }
    }

    public findAllTransactionRepo = async (page: number, limit: number, search: string | null, eventOrganizerId: string) => {
        const skip = (page - 1) * limit
        const where: Prisma.transactionWhereInput = {
            ...(search && {
                OR: [
                    {
                        event: {
                            event_title: { contains: search, mode: 'insensitive' },
                        },
                    },
                    {
                        event: {
                            event_schedule: {
                                some: {
                                    venue: {
                                        venue_name: { contains: search, mode: 'insensitive' },
                                    },
                                },
                            },
                        },
                    },
                ],
            }),
            ...(eventOrganizerId && {
                event: {
                    event_organizer_id: eventOrganizerId,
                },
            }),
        } 

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc'
                },
                select: {
                    id: true, created_at: true, amount: true, payment_method: true, paid_off_at: true,
                    event: {
                        select: {
                            id: true, event_title: true, 
                            event_schedule: {
                                select: {
                                    end_date: true,
                                    venue: {
                                        select: { venue_name: true, venue_coordinate: true }
                                    }
                                }   
                            }
                        }
                    }, 
                    customer: {
                        select: {
                            id: true, username: true, profile_pic: true
                        }
                    },
                    used_discounts: {
                        select: { id: true },
                    },
                }
            }),
            prisma.transaction.count({ where }),
        ])

        // Count average transaction amount
        const allTransactions = await prisma.transaction.findMany({
            where,
            select: { amount: true }
        })
        const totalAmount = allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const averageTransaction = totalAmount / allTransactions.length
        
        const modifiedData = data.map(dt => {
            const eventEndDate = dt.event.event_schedule[0]?.end_date
            const now = new Date()

            // Define transaction status
            let status: 'pending' | 'paid' | 'attended' = 'pending'

            if (dt.paid_off_at) {
                if (eventEndDate && new Date(eventEndDate) > now) {
                    status = 'attended'
                } else {
                    status = 'paid'
                }
            }

            return {
                ...dt,
                is_discount: dt.used_discounts && dt.used_discounts.length > 0,
                status,
            }
        })

        return { data: modifiedData, total, average_transaction: averageTransaction }
    }
}