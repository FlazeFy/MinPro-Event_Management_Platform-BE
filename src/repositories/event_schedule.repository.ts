import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

export class EventScheduleRepository {

    // Cari jadwal yang overlap dengan rentang tanggal input.
    public findAllEventScheduleRepo = async ( page: number, limit: number, startDate: Date | null, endDate: Date | null ) => {
        const skip = (page - 1) * limit
        const where: Prisma.event_scheduleWhereInput = {}

        if (startDate && endDate) {
            where.AND = [
                { start_date: { lte: endDate } },
                { end_date: { gte: startDate } },
            ]
        } else if (startDate) {
            where.end_date = { gte: startDate }
        } else if (endDate) {
            where.start_date = { lte: endDate }
        }

        const [data, total] = await Promise.all([
            prisma.event_schedule.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    start_date: 'asc',
                },
            }),
            prisma.event_schedule.count({
                where,
            }),
        ])

        return { data, total }
    }
}
