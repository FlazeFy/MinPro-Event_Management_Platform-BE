import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'
import { format } from "date-fns"
import { generateRefferalCode } from '../utils/generator.util'
import { pointExpiredDays } from '../const'

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
            ...(status && { status: status as any }),
            ...(
                userId && role === "event_organizer" ? { event: { event_organizer_id: userId } }
                    : userId && role === "customer" ? { customer_id: userId }
                    : {}
            ),
        }

        // Fetch all transactions
        const [transactions, total, aggregate] = await prisma.$transaction([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true, created_at: true, amount: true, payment_method: true, paid_off_at: true, status: true, transaction_pic: true, ticket_token: true,
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
            }),
            prisma.transaction.count({ where }),
            prisma.transaction.aggregate({
                where,
                _avg: { amount: true },
            }),
        ])

        // Define is discount
        const formattedTransactions = transactions.map(dt => ({
            ...dt,
            is_discount: dt.used_discounts.length > 0,
        }))

        return { data: formattedTransactions, total, average_transaction: aggregate._avg.amount ?? 0 }
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

    public createTransactionRepo = async (payment_method: string, attendees: any[], discounts: { id: string; type: "discount" | "points" }[], event_id: string, userId: string) => {
        // Validate event
        const isValidEvent = await prisma.event.findFirst({ where: { id: event_id } })
        if (!isValidEvent) throw { code: 404, message: "Event not found" }

        let finalPrice: number = 0
        // Validate discount
        let isValidDiscount = null
        let isValidPoint = null
        if (isValidEvent.is_paid) {
            if (discounts && discounts.length > 0) {
                for (const item of discounts) {
                    // Validate percentage discount
                    if (item.type === "discount") {
                        isValidDiscount = await prisma.discount.findFirst({
                            where: {
                                id: item.id, event_organizer_id: isValidEvent.event_organizer_id
                            }
                        })    
                        if (!isValidDiscount) throw { code: 404, message: "Discount not found" }

                        // Check if expired
                        if (isValidDiscount.expired_at && new Date() > isValidDiscount.expired_at) throw { code: 400, message: "Discount expired" }
                    }
        
                    // Validate customer point
                    if (item.type === "points") {
                        isValidPoint = await prisma.customer_point.findFirst({
                            where: {
                                id: item.id, customer_id: userId, expired_at: { gte: new Date() }
                            }
                        })
        
                        if (!isValidPoint) throw { code: 404, message: "Customer point not found or expired" }
                    }
                }
            }

            // Calculate total price
            const totalAttendee = attendees.length
            const basePrice = isValidEvent.event_price * totalAttendee
            finalPrice = basePrice

            if (finalPrice > 0)
            // Apply percentage discount
            if (isValidDiscount) finalPrice = finalPrice - (finalPrice * isValidDiscount.percentage / 100)

            // Apply customer points
            if (isValidPoint) finalPrice = finalPrice - isValidPoint.point

            // Prevent negative amount
            if (finalPrice < 0) finalPrice = 0
        }

        const transaction = await prisma.transaction.create({
            data: { 
                customer_id: userId, event_id, payment_method, amount: finalPrice, paid_off_at: null, status: !isValidEvent.is_paid ? "paid" : "pending", ticket_token: !isValidEvent.is_paid ? generateRefferalCode() : null 
            },
        })

        if (isValidEvent.is_paid && isValidDiscount) {
            // Create used discount
            await prisma.used_discount.create({
                data: { transaction_id: transaction.id, discount_id: isValidDiscount.id }
            })
        }

        // Delete customer point after used
        if (isValidEvent.is_paid && isValidPoint) await prisma.customer_point.delete({ where: { id: isValidPoint.id }})

        const attendeeCreated = await prisma.attendee.createMany({
            data: attendees.map((dt) => ({
                transaction_id: transaction.id, fullname: dt.fullname, birth_date: new Date(dt.birth_date), phone_number: dt.phone_number
            }))
        })

        return { ...transaction, attendee: attendeeCreated, event: isValidEvent }
    }

    public updateTransactionRepo = async (id: string, userId: string, filePath: string) => {
        const ticket_token = generateRefferalCode()

        // Update transaction payment status & evidence
        const transaction = await prisma.transaction.update({
            where: { id, customer_id: userId },
            data: { transaction_pic: filePath, status: "paid", ticket_token }
        })
        if (!transaction) throw { code: 404, message: "Transaction not found" }

        // Find event by id
        const event = await prisma.event.findFirst({
            where: { id: transaction.event_id },
        })
        if (!event) throw { code: 404, message: "Event not found" }

        // Find customer for broadcasting email
        const customer = await prisma.customer.findFirst({
            where: { id: transaction.customer_id },
            select: { username: true, email: true }
        })
        if (!customer) throw { code: 404, message: "Customer not found" }

        // Add extra point after each payment validated
        const finalPrice = transaction.amount
        if (finalPrice > 1000) {
            const created_at = new Date()
            const expired_at = new Date(created_at.getTime() + pointExpiredDays * 24 * 60 * 60 * 1000)
            
            await prisma.customer_point.create({
                data: { point: Math.floor(finalPrice / 1000), created_at, expired_at, customer_id: userId }
            })
        }

        return {
            event_title: event?.event_title, amount: transaction.amount, ticket_token, customer: customer
        }
    }
}