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

    public findAllTransactionRepo = async (page: number, limit: number, search: string | null, status: string | null, userId: string, role: string) => {
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
            ...(userId && role === "event_organizer" ? {
                    event: { event_organizer_id: userId }
                }
                : userId && role === "customer" ? {
                    customer_id: userId
                }
            : {}),
        }
    
        // Fetch all transactions 
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { created_at: 'desc' },
            select: {
                id: true, created_at: true, amount: true, payment_method: true, paid_off_at: true,
                event: {
                    select: {
                        id: true, event_title: true,
                        event_schedule: {
                            orderBy: { end_date: 'desc' },
                            take: 1,
                            select: {
                                end_date: true,
                                venue: {
                                    select: {
                                        venue_name: true, venue_coordinate: true,
                                    },
                                },
                            },
                        },
                    },
                },
                customer: {
                    select: {
                        id: true, username: true, profile_pic: true,
                    },
                },
                used_discounts: {
                    select: { id: true },
                },
            },
        })
    
        const now = new Date()
        // Define status and is_discount
        const computedTransactions = transactions.map(dt => {
            const eventEndDate = dt.event.event_schedule[0]?.end_date
            let transactionStatus: 'pending' | 'paid' | 'attended' = 'pending'
    
            if (dt.paid_off_at) {
                if (eventEndDate && new Date(eventEndDate) < now) {
                    transactionStatus = 'attended'
                } else {
                    transactionStatus = 'paid'
                }
            }
    
            return { ...dt, is_discount: dt.used_discounts.length > 0, status: transactionStatus }
        })
    
        // Filter by status
        const filteredTransactions = status ? computedTransactions.filter(dt => dt.status === status) : computedTransactions
    
        // Pagination after filtering
        const total = filteredTransactions.length
        const paginatedData = filteredTransactions.slice(skip, skip + limit)
    
        // Calculate average transaction amount
        const totalAmount = filteredTransactions.reduce((sum, dt) => sum + dt.amount, 0)
        const averageTransaction = total > 0 ? totalAmount / total : 0
    
        return { data: paginatedData, total, average_transaction: averageTransaction }
    }    

    public findCustomerTransactionByEventOrganizerRepo = async (page: number, limit: number, search: string | null, customer_id: string) => {
        const skip = (page - 1) * limit
        const where: Prisma.transactionWhereInput = {
            customer_id,
            ...(search && {
                event: {
                    event_title: { contains: search, mode: 'insensitive' },
                },
            })
        }

        const [data, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    amount: true, created_at: true,
                    event: {
                        select: { event_title: true, event_category: true }
                    }
                }
            }),
            prisma.transaction.count({ where }),
        ])

        return { data, total }
    }

    public findTransactionDashboardByEventOrganizerIdAndEventId = async (eventOrganizerId: string, eventId: string) => {
        // ORM Transaction
        const transactions = await prisma.transaction.findMany({
            where: {
                event_id: eventId,
                event: { event_organizer_id: eventOrganizerId }
            },
            include: {
                attendees: true,
                used_discounts: true
            }
        })
        
        const now = new Date()
        const genMap: Record<string, number> = {}
    
        // Define gen by age
        transactions.forEach(trx => {
            trx.attendees.forEach(dt => {
                const age = now.getFullYear() - new Date(dt.birth_date).getFullYear()
            
                let gen = "Unknown"
                if (age >= 60) gen = "Boomer"
                else if (age >= 44) gen = "Gen X"
                else if (age >= 28) gen = "Millennial"
                else if (age >= 12) gen = "Gen Z"
                else gen = "Gen Alpha"
            
                genMap[gen] = (genMap[gen] || 0) + 1
            })
        })
        
        const attendee_gen_comparison = Object.entries(genMap).map(([context, total]) => ({ context, total }))
        
        // Define discount status by relation
        let with_discount = 0
        let without_discount = 0
        transactions.forEach(trx => {
            if (trx.used_discounts.length > 0) with_discount++
            else without_discount++
        })
        
        const transaction_discount_comparison = [
            { context: "with_discount", total: with_discount },
            { context: "without_discount", total: without_discount }
        ]
        
        const bookingMap = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
        }
        
        // Define booking time category by hour
        transactions.forEach(trx => {
            const hour = new Date(trx.created_at).getHours()
        
            if (hour >= 5 && hour <= 11) bookingMap.morning++
            else if (hour >= 12 && hour <= 16) bookingMap.afternoon++
            else if (hour >= 17 && hour <= 20) bookingMap.evening++
            else bookingMap.night++
        })
        
        const booking_time_comparison = Object.entries(bookingMap).map(([context, total]) => ({ context, total }))
        
        return { attendee_gen_comparison, transaction_discount_comparison, booking_time_comparison}
    }

    public createTransactionRepo = async (payment_method: string, attendees: any[], discount_id: string | null, event_id: string, userId: string) => {
        // Validate event
        const isValidEvent = await prisma.event.findFirst({ where: { id: event_id } })
        if (!isValidEvent) throw { code: 404, message: "Event not found" }

        // Validate discount
        let isValidDiscount = null
        if (discount_id) {
            isValidDiscount = await prisma.discount.findFirst({
                where: { id: discount_id, event_organizer_id: isValidEvent.event_organizer_id }
            })
            if (!isValidDiscount) throw { code: 404, message: "Discount not found" }
            // Check if expired
            if (isValidDiscount.expired_at && new Date() > isValidDiscount.expired_at) throw { code: 400, message: "Discount expired" }
        }

        // Calculate total price
        const totalAttendee = attendees.length
        const basePrice = isValidEvent.event_price * totalAttendee

        let finalPrice = basePrice
        if (isValidDiscount) finalPrice = basePrice - (basePrice * isValidDiscount.percentage / 100)

        const transaction = await prisma.transaction.create({
            data: { customer_id: userId, event_id, payment_method, amount: finalPrice, paid_off_at: null },
        })

        if (discount_id && isValidDiscount) {
            // Create used discount
            await prisma.used_discount.create({
                data: { transaction_id: transaction.id, discount_id }
            })
        }

        const attendeeCreated = await prisma.attendee.createMany({
            data: attendees.map((dt) => ({
                transaction_id: transaction.id, fullname: dt.fullname, birth_date: new Date(dt.birth_date), phone_number: dt.phone_number
            }))
        })

        return { ...transaction, attendee: attendeeCreated, event: isValidEvent }
    }
}