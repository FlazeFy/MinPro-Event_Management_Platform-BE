import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

export class DiscountRepository {
    public findAllDiscountRepo = async (page: number, limit: number, search: string | null, eventOrganizerId: string | null) => {
        const skip = (page - 1) * limit
        const where: Prisma.discountWhereInput = {
            ...(search && {
                description: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                },
            }),
            ...(eventOrganizerId !== null && {
                event_organizer_id: eventOrganizerId,
            }),
        }

        const [data, total] = await Promise.all([
            prisma.discount.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    percentage: 'desc'
                },
            }),
            prisma.discount.count({
                where,
            }),
        ])

        return { data, total }
    }
}
  