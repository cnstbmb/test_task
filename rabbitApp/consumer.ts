import {type} from "os";
import {start} from "repl";
const rabbit = require('../my_modules/rabbitMq');

class Consumer{
    interval: number = 5;
    date: Date;
    minute:number;
    sec:number;
    msec:number;
    timestamp:number;
    timeGroup : number;
    rabbit: any = new rabbit();
    

    constructor(){
        this.date = new Date();
        this.minute = this.date.getMinutes();
        this.sec = this.date.getSeconds();
        this.msec = this.date.getMilliseconds();

        this.timestamp = (this.minute*60*1000) + (this.sec*1000) + this.msec;
        this.determineTimeGroup();

        console.log(this.timeGroup, Date());

        this.startReceivingMessages();
    }

    /**
     * Определить какая в данный момент временная группа. Необходимо для корректного получения сообщений
     */
    determineTimeGroup(){
        let intermediateValue = this.minute / this.interval;
        this.timeGroup = intermediateValue - intermediateValue%1 + 1;
    }

    /**
     * Приступить к получению сообщений из rabbit
     */
    startReceivingMessages(){
        let nextGroup: number = this.timeGroup;
        let nextBoundaryTime: number = nextGroup * this.interval;
        let startTime: number = nextBoundaryTime * 60000 - this.timestamp;

        console.log('Оставшееся время мониторим группу №', this.timeGroup, Date());
        this.rabbit.startReceivingMessages(String(this.timeGroup));
        this.timeGroup++;
        setTimeout(()=>{this.startSetInterval()}, startTime);

    }

    /**
     * Сменить группу мониторинга.
     */
    checkAndAutoIncrementGroup(){
        this.timeGroup = this.timeGroup > 11 ? 1 : this.timeGroup + 1;
    }

    /**
     * Приступить к получению сообщений из текущий группы, с дальнешим переходом по следующим группам.
     */
    startSetInterval(){
        this.rabbit.stopReceivingMessages();
        this.rabbit.startReceivingMessages(String(this.timeGroup));
        this.checkAndAutoIncrementGroup();
        setInterval(()=>{
            this.rabbit.stopReceivingMessages();
            this.rabbit.startReceivingMessages(String(this.timeGroup));
            this.checkAndAutoIncrementGroup();
        }, this.interval*60000)
    }
}

let consumer = new Consumer();