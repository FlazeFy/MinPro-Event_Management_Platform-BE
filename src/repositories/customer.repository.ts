import { prisma } from '../configs/prisma'

export class CustomerRepository {
    public findCustomerByIdRepo = async (id: string) => {
        return await prisma.customer.findUnique({
            where: { id }
        })
    }
}