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
  