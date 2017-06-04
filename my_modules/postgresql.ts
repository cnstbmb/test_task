import errorParser = require('error-stack-parser');
const pg = require('pg');
const Sync = require('sync');
const config = require('../configs/main.json');
const pgConfig: object = {
    user: config.dbConfig.user,
    database: config.dbConfig.database,
    password: config.dbConfig.password,
    host: config.dbConfig.host,
    port: config.dbConfig.port,
    max: config.dbConfig.maxClient,
    idleTimeoutMillis: config.dbConfig.idleTimeoutMillis,
    ssl: config.dbConfig.ssl,
};

interface dbResponse {
    result : {
        rows : object
    }
}

class Postgresql{

    client: any;

    constructor(){
        Sync(()=>{
            if(!this.isConnected()){
                this.client = pg.connect.sync(pg, pgConfig)[0];
            }
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
                let error : any = JSON.stringify(errorParser.parse(err));
                this.client.query("INSERT INTO sys_error (error_text) VALUES (\'"+error+"\')");
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
                let error : any = JSON.stringify(errorParser.parse(err));
                this.client.query("INSERT INTO sys_error (error_text) VALUES (\'"+error+"\')");
            }
            cb(result);
        });
    }


    /**
     * Записать данные в БД
     * @param query - сообщение для записи
     */
    write(query: string):void{
        Sync(()=>{
            if(!this.isConnected())this.client = pg.connect.sync(pg, pgConfig)[0];
            this.client.query(query);
        }, (err: Error)=>{
            if (err){
                let error : any = JSON.stringify(errorParser.parse(err));
                this.client.query("INSERT INTO sys_error (error_text) VALUES (\'"+error+"\')");
            }
        });
    }
}
export = Postgresql;
