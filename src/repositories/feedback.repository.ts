import { prisma } from '../configs/prisma'

export class FeedbackRepository {
    public createFeedbackRepo = async (feedback_rate: number, feedback_body: string, userId: string, role: string) => {
        const customer_id = role === "customer" ? userId : null
        const event_organizer_id = role === "event_organizer" ? userId : null

        return await prisma.feedback.create({
            data: { feedback_rate, feedback_body, customer_id, event_organizer_id }
        })
    }

    public findRandomFeedbackRepo = async (limit: number) => {
        const total = await prisma.feedback.count()
        const skip = total > limit ? Math.floor(Math.random() * (total - limit)) : 0

        const data = await prisma.feedback.findMany({
            skip,
            take: limit,
            select: {
                feedback_body: true, feedback_rate: true,
                customer: {
                    select: { username: true },
                },
                event_organizer: {
                    select: { organizer_name: true }
                }
            },
        })

        return data
    }
}
  