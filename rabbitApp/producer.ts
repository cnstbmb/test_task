import url = require('url');
import Postgres = require('../my_modules/postgresql');

const postgres = new Postgres();
const config = require('../configs/main.json');
const Rabbit = require('../my_modules/rabbitMq');
const rabbit = new Rabbit();

interface incomingMessageConfig {
    id: number;
    group: number;
    text: string;
    [key: number]: string;
}


class DataHandler{
    private data: incomingMessageConfig;
    brokenData : boolean = false;
    query : string;
    producerId: string;

    constructor(producerId: string){
        this.producerId = producerId;
    }

    /**
     * Проверяем JSON.
     * - id является числом
     * - group является числом
     * - group числом от 1 до 12
     * - text не является пустой строкой
     * @returns {boolean}
     */
    checkJSON():boolean{
        let data: incomingMessageConfig = this.data;
        let keys : ['str'] = config.incomingKeys;

        for(let key in keys){
            let type : string = keys[key];
            if(data[key] === null || typeof data[key] !== type) {
                let message: string = "Ошибка. Тип переменной `" + key + "` не соответствует заданному стандарту";
                postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'"+this.query+"\', \'"+message+"\');");
                return false;
            }
        }

        let id : number = data.id;
        let idCheck : boolean = id > 0;
        if(!idCheck) {
            let message: string = "Ошибка. `id`=" + String(id) + " не должен быть отрицательным числом";
            postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'" + this.query + "\', \'" + message + "\');");
            return false;
        }

        let minRange : number = config.groupRange.min;
        let maxRange : number = config.groupRange.max;
        let group : number = data.group;
        let regionCheck : boolean = group >= minRange && group <= maxRange;

        if(!regionCheck) {
            let message: string = "Ошибка. group=`" + String(group) + "` выходит за пределы от `"
                + String(minRange) + "` до `" + String(maxRange) + "`";
            postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'"+this.query+"\', \'"+message+"\');");
            return false;
        }

        let textLen : number = data.text.trim().length;
        let textCheck : boolean = textLen > 0;

        if(!textCheck) {
            let message : string = "Ошибка. text не может быть пустой строкой.";
            postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'"+this.query+"\', \'"+message+"\');");
            return false;
        }

        return true;
    }

    /**
     * Получаем данные из запроса. Преобразовываем в JSON.
     * @param request - string
     */
    getData(request: {url: string}):void{
        this.query = url.parse(request.url, true).query.data.replace(/'/g, "\"").replace(/”/g, "\"");

        try{
            this.data = JSON.parse(this.query);
        }
        catch(e){
            console.error(e);
            this.brokenData = true;
        }
    }

    /**
     * Проверяем входные данные. Соотвествует ли JSON заданному стандарту.
     * @returns {boolean}
     */
    checkData():boolean{
        let message : string;
        if (this.brokenData){
            message = "Ошибка. Не могу распрсить входные данные, проверьте пожалуйста `" + this.query + "`";
            postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'"+this.query+"\', \'"+message+"\');");
            return false;
        }

        let data: incomingMessageConfig = this.data;
        let data_keys : number = Object.keys(data).length;

        if(data_keys !== 3){
            message =  'Полученные массив не соответствует заданному стандарту ' +
                '{id: number, group: number, text: string}. Операция отклонена.';
            postgres.write("INSERT INTO error_events (event_log, event_reason) VALUES (\'"+this.query+"\', \'"+message+"\');");
            return false;
        }

        return this.checkJSON()

    };

    /**
     * Отправялем полученные данные в rabbitMq
     */
    sendDataToRabbit(){
        let queue: string = String(this.data.group);
        let data: string = JSON.stringify(this.data);

        rabbit.publishMessage(queue, data);
        postgres.write("INSERT INTO event_counter (producer_name) VALUES (\'"+this.producerId+"\');");
    }
}

export = DataHandler;