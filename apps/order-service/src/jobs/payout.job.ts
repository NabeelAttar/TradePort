import prisma from '@packages/libs/prisma'
import cron from 'node-cron'

const MAX_RETRIES = 5

cron.schedule("0 2 * * *", async () => {
  console.log("Running payout cron...")

  const now = new Date()

  try {

    const payoutsToProcess = await prisma.payouts.findMany({
      where: {
        scheduledAt: { lte: now },
        OR: [
          { status: "pending" },
          {
            status: "failed",
            retryCount: { lt: MAX_RETRIES }
          }
        ]
      }
    })

    if (!payoutsToProcess.length) {
      console.log("No payouts to process.")
      return
    }

    for (const payout of payoutsToProcess) {

      try {

        await prisma.$transaction(async (tx) => {

          //  Increase seller balance
          await tx.sellers.update({
            where: { id: payout.sellerId },
            data: {
              bankBalance: {
                increment: payout.sellerAmount
              }
            }
          })

          //  Increase platform balance
          const config = await tx.site_config.findFirst()
          if (!config) throw new Error("Platform config missing")

          await tx.site_config.update({
            where: { id: config.id },
            data: {
              platformBalance: {
                increment: payout.platformFee
              }
            }
          })

          //  Mark payout as paid
          await tx.payouts.update({
            where: { id: payout.id },
            data: {
              status: "paid",
              processedAt: new Date(),
              lastError: null
            }
          })

        })

        console.log(`Payout processed: ${payout.id}`)

      } catch (innerError: any) {

        const updated = await prisma.payouts.update({
          where: { id: payout.id },
          data: {
            status: "failed",
            retryCount: { increment: 1 },
            processedAt: new Date(),
            lastError: innerError?.message || "Unknown error"
          }
        })

        console.error(`Payout failed: ${payout.id}`, innerError)

        //If max retries reached → cancel permanently
        if (updated.retryCount > MAX_RETRIES) {

          await prisma.payouts.update({
            where: { id: payout.id },
            data: {
              status: "cancelled"
            }
          })

          console.error(`Payout permanently cancelled: ${payout.id}`)
        }
      }
    }

  } catch (error) {
    console.error("Payout cron crashed:", error)
  }
})