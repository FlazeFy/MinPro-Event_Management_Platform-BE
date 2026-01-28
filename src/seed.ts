import "dotenv/config"
import { prisma } from "./configs/prisma"
import customerSeeder from "./seeders/customer.seeder"

class Seeder {
    private customerSeeder = new customerSeeder()
    private password = "nopass123"

    private clearAllTables = async () => {
        await prisma.customer.deleteMany()
    }

    public run = async () => {
        try {
            // Delete all table
            await this.clearAllTables()

            // Run the seeder
            await this.customerSeeder.createMany(100, this.password)
        } catch (err) {
            console.error(err)
        } finally {
            await prisma.$disconnect()
        }
    }
}

new Seeder().run()
