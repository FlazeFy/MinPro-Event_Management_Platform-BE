import { prisma } from '../configs/prisma'
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
}