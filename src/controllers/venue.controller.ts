import { NextFunction, Request, Response } from "express"
import { VenueRepository } from "../repositories/venue.repository"

export class VenueController {
    private venueRepository: VenueRepository

    constructor(){
        this.venueRepository = new VenueRepository()
    }

    public getAllVenueController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query params
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 14
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
    
            // Repository : Get all venue
            const result = await this.venueRepository.findAllVenueRepo(page, limit, search)
            if (!result) throw { code: 404, message:  "Venue not found" }
    
            // Success response
            res.status(200).json({
                message: "Get venue successful",
                data: result.data,
                meta: {
                    page, limit, total: result.total, total_page: Math.ceil(result.total / limit),
                },
            })
        } catch (error: any) {
            next(error)
        }
    }
}