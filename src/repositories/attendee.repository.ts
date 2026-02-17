import { prisma } from '../configs/prisma'
import { format } from "date-fns"

export class AttendeeRepository {
    public findEventAttendeePeriodicByOrganizerId = async (eventOrganizerId: string) => {
        // Fetching
        const attendees = await prisma.attendee.findMany({
            select: {
                transaction: {
                    select: {
                        event: { 
                            select: { 
                                event_category: true,
                                event_schedule: {
                                    select: { start_date: true }
                                } 
                            } 
                        }
                    }
                }
            },
            where: { 
                transaction: {
                    event: { event_organizer_id: eventOrganizerId }
                }
            },
        })

        // Group by month/year
        const monthlyData: Record<string, Record<string, number>> = {}

        for (const dt of attendees) {
            // Only event who had schedule
            const startDate = dt.transaction.event.event_schedule[0]?.start_date
            if (!startDate) continue

            const monthLabel = format(startDate, "MMM yyyy") 
            const category = dt.transaction.event.event_category

            if (!monthlyData[monthLabel]) monthlyData[monthLabel] = {}
            if (!monthlyData[monthLabel][category]) monthlyData[monthLabel][category] = 0

            monthlyData[monthLabel][category] += 1
        }

        // Sort month descending to take last 7
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7).reverse()

        // Make categories as label
        const categories = Array.from(new Set(attendees.map(a => a.transaction.event.event_category)))

        const datasets = categories.map(category => ({
            label: category,
            data: sortedMonths.map(month => monthlyData[month][category] ?? 0),
        }))

        return { labels: sortedMonths, datasets }
    }
}
  