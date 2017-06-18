import errorParser = require('error-stack-parser');
const pg = require('pg');

const copyFrom = require('pg-copy-streams').from;
const str = require('string-to-stream');

const Sync = require('sync');
const config = require('../configs/main.json');
const pgConfig: object = Object.assign({}, config.dbConfig);

interface dbResponse {
    result : {
        rows : object
    }
}

class Postgresql{

    client: any;

    private messages: string;
    private errorEvents: string;
    private eventCounter: string;
    private sysError: string;

    private timeOutMessagesId: any;
    private timeOutErrorEventsId: any;
    private timeOutEventCounterId: any;
    private timeOutSysErrorId: any;

    constructor(){
        Sync(()=>{
            this.initDataPackets();
            if(!this.isConnected()){this.client = pg.connect.sync(pg, pgConfig)[0];}
        }, (err: Error)=>{
            if (err)console.error(err);
        });
    }

    /**
     * Проверяет существует ли соединение с базой данных
     * @returns {boolean}
     */
    private isConnected(): boolean{
        return null != this.client;
    }

    read(query: string, cb:any):void{
        Sync(()=>{
            if(!this.isConnected())this.client = pg.connect.sync(pg, pgConfig)[0];
            return this.client.query.sync(this.client, query);
        }, (err: Error, response: object)=>{
            if (err){
                let error : string = JSON.stringify(errorParser.parse(err));
                let consumerTime: number = Date.now();
                this.addToSysErrorPacket(error, consumerTime);
            }
            cb(response);
        });
    }

    /**
     * Получить сообщения и данные о сообщениях из ДБ.
     * @param cb - полученные данные передаем в коллбэк
     */
    getRabbitEventsData(cb:any):void{
        Sync(()=> {
            if (!this.isConnected()) this.client = pg.connect.sync(pg, pgConfig)[0];
            let messages: dbResponse = this.client.query.future(this.client, 'SELECT * FROM messages;');
            let numbers_messages: dbResponse = this.client.query.future(this.client, 'SELECT COUNT(*) FROM messages;');
            let numbers_errors: dbResponse = this.client.query.future(this.client, 'SELECT COUNT(*) FROM error_events;');
            let numbers_events: dbResponse = this.client.query.future(this.client, 'SELECT COUNT(*) FROM event_counter;');
            return {
                'messages': messages.result.rows,
                'numbers_messages': numbers_messages.result.rows,
                'numbers_errors': numbers_errors.result.rows,
                'numbers_events': numbers_events.result.rows
            }
        }, (err: Error, result: object)=> {
            if (err){
                let error : string = JSON.stringify(errorParser.parse(err));
                let consumerTime: number = Date.now();
                this.addToSysErrorPacket(error, consumerTime);
            }
            cb(result);
        });
    }

    initDataPackets():void{
        this.messages = '';
        this.errorEvents = '';
        this.eventCounter = '';
        this.sysError = '';
    }

    addToMessagePacket(producerTime: number, consumerTime: number, message: string):void{
        this.messages += producerTime.toString() + "|" + consumerTime.toString() + "|" + message + '\n';
        this.writeMessages();
    }

    addToErrorEventsPacket(consumerTime: number, query: string, message: string):void{
        this.errorEvents +=  consumerTime.toString() + '|' + query  + '|' + message + '\n';
        this.writeErrorEvents();
    }

    addToEventCounterPacket(producerId: string, consumerTime: number):void{
        this.eventCounter += producerId + '|' + consumerTime.toString() + '\n';
        this.writeEventCounter();
    }


    addToSysErrorPacket(error:string, consumerTime: number):void{
        this.sysError+= error + '|'  + consumerTime.toString() + '\n';
        this.writeSysError();
    }

    private writeMessages():void{
        if (this.timeOutMessagesId == undefined || this.timeOutMessagesId._called == true){
            this.timeOutMessagesId = setTimeout(()=>{
                let messages: string = this.messages;
                this.messages = '';
                this.copyDataPacket('messages', messages);
                clearTimeout(this.timeOutMessagesId);
            }, 10000);
        }
    };

    private writeErrorEvents():void{
        if (this.timeOutErrorEventsId == undefined || this.timeOutErrorEventsId._called == true){
            this.timeOutErrorEventsId = setTimeout(()=>{
                let errorEvents: string = this.errorEvents;
                this.errorEvents = '';
                this.copyDataPacket('error_events(event_date, event_log, event_reason)', errorEvents);
                clearTimeout(this.timeOutErrorEventsId);
            }, 10000);
        }
    };

    writeEventCounter():void{
        if (this.timeOutEventCounterId == undefined || this.timeOutEventCounterId._called == true){
            this.timeOutEventCounterId = setTimeout(()=>{
                let eventCounter: string = this.eventCounter;
                this.errorEvents = '';
                this.copyDataPacket('event_counter', eventCounter);
                clearTimeout(this.timeOutEventCounterId);
            }, 10000);
        }
    };


    private writeSysError():void{
        if (this.timeOutSysErrorId == undefined || this.timeOutSysErrorId._called == true){
            this.timeOutSysErrorId = setTimeout(()=>{
                let sysError: string = this.sysError;
                this.errorEvents = '';
                this.copyDataPacket('sys_error', sysError);
                clearTimeout(this.timeOutSysErrorId);
            }, 10000);
        }
    };

    private copyDataPacket(table:string, data:string):void{
        Sync(()=>{
            console.log(Date.now());
            console.log('Записываем данные в БД, таблица = ' + table + '; данные = ' + data);
            if(!this.isConnected())this.client = pg.connect.sync(pg, pgConfig)[0];
            let stream:any = this.client.query(copyFrom('COPY '+table+' FROM STDIN WITH (DELIMITER "|")'));
            let stdin:any = str(data);

            stream.on('error', (err:any)=>{
                console.log('messages stream error!');
                console.log(err);
            });
            stream.on('end', ()=>{
                console.log('messages stream end!');
            });

            stdin.pipe(stream);
        }, (err: Error)=>{
            if (err){
                let error : string = JSON.stringify(errorParser.parse(err));
                let consumerTime: number = Date.now();
                this.addToSysErrorPacket(error, consumerTime);
            }
        });
    }
}
export = Postgresql;
