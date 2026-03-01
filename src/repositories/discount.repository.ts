import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

export class DiscountRepository {
    public findDiscountByEventOrganizerRepo = async (event_organizer_id: string) => {
        return await prisma.discount.findMany({
            where : { event_organizer_id },
            select: {
                id: true, expired_at: true, description: true, percentage: true                
            },
            orderBy: {
                expired_at: 'desc'
            },
        })
    }

    public findMyDiscountRepo = async (page: number, limit: number, userId: string, role: string) => {
        const skip = (page - 1) * limit
        const today = new Date()

        if (role === "customer") {
            // Get active discounts
            const discountsPromise = prisma.discount.findMany({
                where: {
                    customer_id: userId,
                    expired_at: { 
                        gte: today,
                        not: null, 
                    }
                },
                select: {
                    id: true, expired_at: true, description: true, percentage: true, created_at: true
                }
            })

            // Get active customer points
            const pointsPromise = prisma.customer_point.findMany({
                where: {
                    customer_id: userId,
                    expired_at: { gte: today }
                },
                select: {
                    id: true, expired_at: true, point: true, created_at: true
                }
            })

            const [discounts, points] = await Promise.all([discountsPromise, pointsPromise])

            // Map customer_point to match discount
            const mappedPoints = points.map((item) => ({
                id: item.id,
                expired_at: item.expired_at,
                description: "Redeem token gift",
                percentage: null, 
                created_at: item.created_at,
                point: item.point
            }))

            // Combine discount & point
            const combined = [...discounts, ...mappedPoints]

            // Sort by expired_at
            combined.sort((a, b) => {
                const dateA = a.expired_at ? new Date(a.expired_at).getTime() : 0
                const dateB = b.expired_at ? new Date(b.expired_at).getTime() : 0
                return dateB - dateA
            })
            const total = combined.length

            // Apply pagination
            const paginated = combined.slice(skip, skip + limit)

            return { data: paginated, total }
        } else {
            // Event organizer discount
            const where = {
                event_organizer_id: userId,
                expired_at: { gte: today }
            }

            const [data, total] = await Promise.all([
                prisma.discount.findMany({
                    where,
                    take: limit,
                    skip,
                    select: {
                        id: true, expired_at: true, description: true, percentage: true, created_at: true
                    },
                    orderBy: { expired_at: "desc" }
                }),
                prisma.discount.count({ where })
            ])

            return { data, total }
        }
    }

    public createDiscountRepo = async (event_organizer_id: string, percentage: number, description: string) => {
        return await prisma.discount.create({
            data: { event_organizer_id, percentage, description }
        })
    }

    public updateDiscountByIdRepo = async (id: string, event_organizer_id: string, description: string) => {
        return await prisma.discount.update({
            data: { description },
            where: { id, event_organizer_id }
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
  