import prisma from '@packages/libs/prisma'
import cron from 'node-cron'

// after every 1 hour this function runs
cron.schedule("0 * * * *", async() => {
    try {
        const now = new Date();
        
        // delete products where products have deletedAt before now
        await prisma.products.deleteMany({
            where: {
                isDeleted: true,
                deletedAt: {lte: now},
                // less than equals
            },
        })

    } catch (error) {
        console.log(error)
    }
})

