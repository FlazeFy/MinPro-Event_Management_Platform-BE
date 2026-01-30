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

    public createDiscountRepo = async (event_organizer_id: string, percentage: number, description: string) => {
        return await prisma.discount.create({
            data: { event_organizer_id, percentage, description }
        })
    }

    public deleteDiscountByIdRepo = async (userId: string, discountId: string) => {
        try {
            return await prisma.discount.delete({
                where: { id: discountId, event_organizer_id: userId }
            })
        } catch (error: any) {
            if (error.code === "P2025") return null
            throw error
        }
    } 
}
  