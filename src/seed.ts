import "dotenv/config"
import { prisma } from "./configs/prisma"
import CustomerSeeder from "./seeders/customer.seeder"
import EventOrganizerSeeder from "./seeders/event_organizer.seeder"
import ReferralCodeHistorySeeder from "./seeders/referral_code_history.seeder"
import SocialMediaSeeder from "./seeders/social_media.seeder"
import VenueSeeder from "./seeders/venue.seeder"

class Seeder {
    private customerSeeder = new CustomerSeeder()
    private eventOrganizerSeeder = new EventOrganizerSeeder()
    private socialMediaSeeder = new SocialMediaSeeder()
    private venueSeeder = new VenueSeeder()
    private refCodeSeeder = new ReferralCodeHistorySeeder()
    private password = "nopass123"

    private clearAllTables = async () => {
        await prisma.referral_code_history.deleteMany()
        await prisma.social_media.deleteMany()
        await prisma.customer.deleteMany()
        await prisma.event_organizer.deleteMany()
        await prisma.venue.deleteMany()
    }

    public run = async () => {
        try {
            // Delete all table
            await this.clearAllTables()

            // Run the seeder
            await this.venueSeeder.createMany(50)
            await this.customerSeeder.createMany(100, this.password)
            await this.eventOrganizerSeeder.createMany(25, this.password)
            await this.socialMediaSeeder.createMany(20)
            await this.refCodeSeeder.createMany(100)
        } catch (err) {
            console.error(err)
        } finally {
            await prisma.$disconnect()
        }
    }
}

new Seeder().run()
