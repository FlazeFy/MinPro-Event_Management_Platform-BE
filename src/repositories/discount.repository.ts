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
        let where = {}

        if (role === "customer") {
            where = { customer_id: userId } 
        } else {
            where = { event_organizer_id: userId}
        }

        const [ data, total ] = await Promise.all([
            prisma.discount.findMany({
                where,
                take: limit,
                skip,
                select: {
                    id: true, expired_at: true, description: true, percentage: true, created_at: true                
                },
                orderBy: {
                    expired_at: 'desc'
                },
            }),
            prisma.discount.count({ where })
        ])

        return { data, total }
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
  