import { prisma } from '../configs/prisma'
import { Prisma } from '../generated/prisma/client'

export class VenueRepository {
    public findAllVenueRepo = async (page: number, limit: number, search: string | null) => {
        const skip = (page - 1) * limit
        const keyword = search?.trim()
        const where: Prisma.venueWhereInput | undefined = keyword ? {
            OR: [
                    {
                        venue_name: {
                            contains: keyword, mode: 'insensitive',
                        },
                    },
                    {
                        venue_description: {
                            contains: keyword, mode: 'insensitive',
                        },
                    },
                    {
                        venue_address: {
                            contains: keyword, mode: 'insensitive',
                        },
                    },
                ],
            }
        : undefined

        const [data, total] = await Promise.all([
            prisma.venue.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    venue_name: 'asc',
                },
            }),
            prisma.venue.count({
                where,
            }),
        ])

        return { data, total }
    }
}
  