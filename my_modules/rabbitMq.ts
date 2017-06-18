import Postgres = require('./postgresql');

const postgres = new Postgres();
const Sync = require('sync');
const shortid = require('shortid');
const Amqplib = require("amqplib/callback_api");
const config = require('../configs/main.json');
const rabbitMQConfig = {
    host: config.rabbitMqConfig.host,
    port: config.rabbitMqConfig.port,
    login: config.rabbitMqConfig.login,
    password: config.rabbitMqConfig.passwpord,
    connectionTimeout: config.rabbitMqConfig.connectionTimeout,
    authMechanism: config.rabbitMqConfig.authMechanism,
    vhost: config.rabbitMqConfig.vhost,
    noDelay: config.rabbitMqConfig.noDelay,
    ssl: config.rabbitMqConfig.ssl
};
shortid.characters(config.shortidCharacters);

class Rabbit{
    amqp: any = Amqplib;
    exchange: string = 'messages';
    type: string = 'direct';
    channel:any;
    producerTime: number;
    message: string;
    consumerTag: string = shortid.generate();

    constructor() {
        this.establishConnection();
    }

    establishConnection():void{
        Sync(()=>{
            let connection: any = this.amqp.connect.sync(rabbitMQConfig);
            let channel: any = connection.createChannel.sync(connection);
            this.channel = channel;
            channel.assertExchange(this.exchange, this.type);
            for (let i = 1; i <= 12; i++) {
                channel.assertQueue(String(i), {durable: true, noAck: false});
                channel.bindQueue(String(i), this.exchange, String(i));
            }
        });
    }

    publishMessage(queue: string, message: any){
        Sync(()=>{
            if(typeof this.channel == 'undefined'){
                this.establishConnection();
            }
            this.channel.publish(this.exchange, queue, new Buffer(message), {'timestamp':Date.now()});
        });
    }

    startReceivingMessages(queue:string){
        Sync(()=>{
            let connection: any = this.amqp.connect.sync('amqp://localhost');
            let channel: any = connection.createChannel.sync(connection);
            this.channel = channel;
            channel.prefetch(1);
            console.log('получаем сообщения сообщения из очереди №'+queue, Date());
            channel.consume(queue, (msg: any)=>{
                this.message = msg.content;
                this.producerTime = msg.properties.timestamp;
                let consumerTime: number = Date.now();
                postgres.addToMessagePacket(this.producerTime, consumerTime, this.message);
                channel.ack(msg);
            }, {'consumerTag': this.consumerTag});
        });
    }

    stopReceivingMessages(){
        Sync(()=>{
            if(typeof this.channel == 'undefined'){
                this.establishConnection();
            }
            console.log('отключаемся от очереди c тэгом', this.consumerTag, Date());
            this.channel.cancel(this.consumerTag);
        });
    }
}

export = Rabbit;
