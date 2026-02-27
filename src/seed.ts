import "dotenv/config"
import { prisma } from "./configs/prisma"
import CustomerSeeder from "./seeders/customer.seeder"
import DiscountSeeder from "./seeders/discount.seeder"
import EventOrganizerSeeder from "./seeders/event_organizer.seeder"
import ReferralCodeHistorySeeder from "./seeders/referral_code_history.seeder"
import SocialMediaSeeder from "./seeders/social_media.seeder"
import VenueSeeder from "./seeders/venue.seeder"
import EventSeeder from "./seeders/event.seeder"
import EventScheduleSeeder from "./seeders/event_schedule.seeder"
import TransactionSeeder from "./seeders/transaction.seeder"
import AttendeeSeeder from "./seeders/attendee.seeder"
import ReviewSeeder from "./seeders/review.seeder"
import UsedDiscountSeeder from "./seeders/used_discount.seeder"
import FeedbackSeeder from "./seeders/feedback.seeder"
import CustomerPointSeeder from "./seeders/customer_point.seeder"

class Seeder {
    private customerSeeder = new CustomerSeeder()
    private eventOrganizerSeeder = new EventOrganizerSeeder()
    private socialMediaSeeder = new SocialMediaSeeder()
    private venueSeeder = new VenueSeeder()
    private refCodeSeeder = new ReferralCodeHistorySeeder()
    private discountSeeder = new DiscountSeeder()
    private eventSeeder = new EventSeeder()
    private eventScheduleSeeder = new EventScheduleSeeder()
    private transactionSeeder = new TransactionSeeder()
    private attendeeSeeder = new AttendeeSeeder()
    private reviewSeeder = new ReviewSeeder()
    private usedDiscountSeeder = new UsedDiscountSeeder()
    private feedbackSeeder = new FeedbackSeeder()
    private customerPointSeeder = new CustomerPointSeeder()
    private password = "nopass123"

    private clearAllTables = async () => {
        await prisma.feedback.deleteMany()
        await prisma.used_discount.deleteMany()
        await prisma.review.deleteMany()
        await prisma.attendee.deleteMany()
        await prisma.transaction.deleteMany()
        await prisma.event_schedule.deleteMany()
        await prisma.event.deleteMany()
        await prisma.discount.deleteMany()
        await prisma.referral_code_history.deleteMany()
        await prisma.social_media.deleteMany()
        await prisma.customer_point.deleteMany()
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
            await this.customerPointSeeder.createMany(50)
            await this.eventOrganizerSeeder.createMany(25, this.password)
            await this.socialMediaSeeder.createMany(20)
            await this.discountSeeder.createMany(10)
            await this.eventSeeder.createMany(50)
            await this.eventScheduleSeeder.createMany(50)
            await this.transactionSeeder.createMany(200)
            await this.attendeeSeeder.createMany(1000)
            await this.reviewSeeder.createMany(175)
            await this.usedDiscountSeeder.createMany(175)
            await this.feedbackSeeder.createMany(100)
            await this.refCodeSeeder.createMany(100)
        } catch (err) {
            console.error(err)
        } finally {
            await prisma.$disconnect()
        }
    }
}

new Seeder().run()
