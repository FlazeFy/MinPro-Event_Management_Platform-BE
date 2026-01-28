import "dotenv/config"
import { prisma } from "./configs/prisma"
import CustomerSeeder from "./seeders/customer.seeder"
import EventOrganizerSeeder from "./seeders/event_organizer.seeder"

class Seeder {
    private customerSeeder = new CustomerSeeder()
    private eventOrganizer = new EventOrganizerSeeder()
    private password = "nopass123"

    private clearAllTables = async () => {
        await prisma.customer.deleteMany()
        await prisma.event_organizer.deleteMany()
    }

    public run = async () => {
        try {
            // Delete all table
            await this.clearAllTables()

            // Run the seeder
            await this.customerSeeder.createMany(100, this.password)
            await this.eventOrganizer.createMany(25, this.password)
        } catch (err) {
            console.error(err)
        } finally {
            await prisma.$disconnect()
        }
    }
}

new Seeder().run()
