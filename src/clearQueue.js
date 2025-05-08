// clearQueue.js: Consumes and acknowledges all messages in the payment_approved queue to clear it
const amqp = require("amqplib");

async function clearQueue(queueName) {
  const conn = await amqp.connect("amqp://rabbitmq:5672");
  const channel = await conn.createChannel();
  await channel.assertQueue(queueName, {durable: false});
  console.log(`Clearing all messages from queue: ${queueName}`);
  let cleared = 0;
  await channel.consume(
    queueName,
    (msg) => {
      if (msg !== null) {
        channel.ack(msg);
        cleared++;
      }
    },
    {noAck: false}
  );
  // Wait a few seconds to ensure all messages are consumed, then close
  setTimeout(async () => {
    console.log(`Cleared ${cleared} messages.`);
    await channel.close();
    await conn.close();
    process.exit(0);
  }, 5000);
}

clearQueue("payment_approved");
