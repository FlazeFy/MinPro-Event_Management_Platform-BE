import { NextFunction, Request, Response } from "express"
import { VenueRepository } from "../repositories/venue.repository"
import { paginationDefault } from "../const"

export class VenueController {
    private venueRepository: VenueRepository

    constructor(){
        this.venueRepository = new VenueRepository()
    }

    public getAllVenueController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Query Param
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || paginationDefault
            const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
    
            // Repo : Get all venue
            const result = await this.venueRepository.findAllVenueRepo(page, limit, search)
            if (!result || result.data.length === 0) throw { code: 404, message:  "Venue not found" }
    
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

    public postCreateVenueController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Request Body
            const { venue_name, venue_description, venue_address, venue_coordinate } = req.body
    
            // Repo : Create venue
            const result = await this.venueRepository.createVenueRepo(venue_name, venue_description, venue_address, venue_coordinate)
            if (!result) throw { code: 500, message:  "Something went wrong" }
    
            // Success response
            res.status(201).json({
                message: "Venue created",
                data: result
            })
        } catch (error: any) {
            next(error)
        }
    }
}