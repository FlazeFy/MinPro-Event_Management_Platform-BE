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

    public createVenueRepo = async (venue_name: string, venue_description: string, venue_address: string, venue_coordinate: string) => {
        const isVenueNameUsed = await prisma.venue.findUnique({
            where: { venue_name }
        })
        if (isVenueNameUsed) throw { code: 409, message:  "Venue name already being used. Please use an unique one" }
        
        return await prisma.venue.create({
            data: { venue_name, venue_description, venue_address, venue_coordinate }
        })
    }
}
  