declare class Rabbit {
    amqp: any;
    exchange: string;
    type: string;
    channel: any;
    producerTime: number;
    message: string;
    consumerTag: string;
    constructor();
    establishConnection(): void;
    publishMessage(queue: string, message: any): void;
    startReceivingMessages(queue: string): void;
    stopReceivingMessages(): void;
}
export = Rabbit;
