// kafka service is not like rest api, its a message broker, so we dont need a traditional api setup here
import { kafka } from '@packages/utils/kafka'
import { updateUserAnalytics } from './services/analytics-service'

const consumer = kafka.consumer({groupId: "users-events-group"});

const eventQueue: any[] = [];

// humare website pe 1ms me 1 sec me 10000 -20000 log visit karskte h, product view kar skte h , to data har ms update hoga, to actual
// data har ms update karneki jagah har 3 sec me karege, totall 3 sec me jitna jis bhi type ka data jama hoga iss eventQueue array me vo sb ek saath daal dege
// this is called as batch processing

const processQueue = async () => {  
    if(eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue.length  = 0;

    for(const event of events){
        if(event.action === "shop_visit"){
            // update shop analytics
        }

        const validActions = [
            "add_to_wishlist",
            "add_to_cart",
            "prodct_view",
            "remove_from_wishlist",
        ]
        if(!event.action || !validActions.includes(event.action)){
            continue;
        }
        try {
            await updateUserAnalytics(event);
        } catch (error) {
            console.log("Error processing event:", error);
        }
    }
}

setInterval(processQueue, 3000); //3 sec logic

// kafka consumer
export const consumeKafkaMessages = async () => {
    // connect to kafka borker
    await consumer.connect();
    await consumer.subscribe({topic: "users-events", fromBeginning: false});
    await consumer.run({
        eachMessage: async({message}) => {
            if(!message.value) return;
            const event = JSON.parse(message.value.toString());
            eventQueue.push(event);
        }
    })
}

consumeKafkaMessages().catch(console.error)