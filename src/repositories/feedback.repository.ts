import { prisma } from '../configs/prisma'

export class FeedbackRepository {
    public createFeedbackRepo = async (feedback_rate: number, feedback_body: string) => {
        return await prisma.feedback.create({
            data: { feedback_rate, feedback_body }
        })
    }
}
  