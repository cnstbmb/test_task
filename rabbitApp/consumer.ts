import Postgres = require('../my_modules/postgresql');
const rabbit = require('../my_modules/rabbitMq');

const postgres = new Postgres();

class Consumer{
    interval: number = 5;
    minAtmsec: number = 60000;
    date: Date;
    minute:number;
    sec:number;
    msec:number;
    timestamp:number;
    timeGroup : number;
    rabbit: any = new rabbit();
    intervalId: object;
    

    constructor(){
        this.date = new Date();
        this.minute = this.date.getMinutes();
        this.sec = this.date.getSeconds();
        this.msec = this.date.getMilliseconds();

        this.timestamp = (this.minute*60*1000) + (this.sec*1000) + this.msec;
        this.determineTimeGroup();

        console.log(this.timeGroup, Date());
    }

    /**
     * Определить какая в данный момент временная группа. Необходимо для корректного получения сообщений
     */
    determineTimeGroup():void{
        let minute: number = this.minute;
        if(minute > 60){
            let message: string = 'По непонятной причине, this.getMinutes() вернул значение больше 60! ' +
                'устанавливаем значение 60.такой момент маловероятен.';
            let consumerTime: number = Date.now();
            postgres.addToSysErrorPacket(message, consumerTime);
            minute = 60;
        }
        let intermediateValue = minute / this.interval;
        this.timeGroup = intermediateValue - intermediateValue%1 + 1;
    }

    /**
     * Приступить к получению сообщений из rabbit
     */
    startReceivingMessages():object{
        let nextGroup: number = this.timeGroup;
        let nextBoundaryTime: number = nextGroup * this.interval;
        let startTime: number = nextBoundaryTime * 60000 - this.timestamp;

        console.log('Оставшееся время мониторим группу №', this.timeGroup, Date());
        this.rabbit.startReceivingMessages(String(this.timeGroup));
        this.timeGroup++;
        return setTimeout(()=>{this.startSetInterval()}, startTime);
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
    startSetInterval():void{
        this.rabbit.stopReceivingMessages();
        this.rabbit.startReceivingMessages(String(this.timeGroup));
        this.checkAndAutoIncrementGroup();
        this.intervalId = setInterval(()=>{
            this.rabbit.stopReceivingMessages();
            this.rabbit.startReceivingMessages(String(this.timeGroup));
            this.checkAndAutoIncrementGroup();
        }, this.interval*this.minAtmsec);
    }
}

export = Consumer;