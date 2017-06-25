import _ = require('underscore');
import url = require('url');
import Postgres = require('../my_modules/postgresql');
import * as Url from "url";

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
            if(_.isNull(data[key]) || typeof data[key] !== type) {
                let message: string = "Ошибка. Тип переменной `" + key + "` не соответствует заданному стандарту";
                let consumerTime: number = Date.now();
                postgres.addToErrorEventsPacket(consumerTime, this.query, message);
                return false;
            }
        }

        let id : number = data.id;
        let idCheck : boolean = id > 0;
        if(!idCheck) {
            let message: string = "Ошибка. `id`=" + String(id) + " не должен быть отрицательным числом";
            let consumerTime: number = Date.now();
            postgres.addToErrorEventsPacket(consumerTime, this.query, message);
            return false;
        }

        let minRange: number, maxRange: number, group : number;
        [minRange, maxRange, group] = [config.groupRange.min, config.groupRange.max, data.group];
        let regionCheck : boolean = group >= minRange && group <= maxRange;

        if(!regionCheck) {
            let message: string = "Ошибка. group=`" + String(group) + "` выходит за пределы от `"
                + String(minRange) + "` до `" + String(maxRange) + "`";
            let consumerTime: number = Date.now();
            postgres.addToErrorEventsPacket(consumerTime, this.query, message);
            return false;
        }

        let textLen : number = data.text.trim().length;
        let textCheck : boolean = textLen > 0;

        if(!textCheck) {
            let message : string = "Ошибка. text не может быть пустой строкой.";
            let consumerTime: number = Date.now();
            postgres.addToErrorEventsPacket(consumerTime, this.query, message);
            return false;
        }

        return true;
    }

    /**
     * Получаем данные из запроса. Преобразовываем в JSON.
     * @param request - string
     */
    getData(request: {url: string}):boolean{
        if(typeof request.url != "string"){
            this.brokenData = true;
            return this.brokenData;
        }

        let data : Url.Url = url.parse(request.url, true);

        try {
            this.query = data.query.data.replace(/'/g, "\"").replace(/”/g, "\"");
            this.data = JSON.parse(this.query);
            this.brokenData = false;
        }catch (e){
            this.brokenData = true;
        }

        return this.brokenData;
    }

    /**
     * Проверяем входные данные. Соотвествует ли JSON заданному стандарту.
     * @returns {boolean}
     */
    checkData():boolean{
        let message : string;
        if (this.brokenData){
            message = "Ошибка. Не могу распрсить входные данные, проверьте пожалуйста `" + this.query + "`";
            let consumerTime: number = Date.now();
            postgres.addToErrorEventsPacket(consumerTime, this.query, message);
            return false;
        }

        let data: incomingMessageConfig = this.data;
        let data_keys : number = Object.keys(data).length;

        if(data_keys !== 3){
            message =  'Полученные массив не соответствует заданному стандарту ' +
                '{id: number, group: number, text: string}. Операция отклонена.';
            let consumerTime: number = Date.now();
            postgres.addToErrorEventsPacket(consumerTime, this.query, message);
            return false;
        }

        let dataIsOk: boolean = this.checkJSON();

        if(dataIsOk){
            this.sendDataToRabbit();
        }
        return dataIsOk;

    };

    /**
     * Отправялем полученные данные в rabbitMq
     */
    sendDataToRabbit():boolean{
        if(typeof this.data == 'undefined' || typeof this.data.group == 'undefined'){
            return false;
        }

        let data: string = JSON.stringify(this.data);
        let queue: string = String(this.data.group);

        rabbit.publishMessage(queue, data);
        let consumerTime: number = Date.now();
        postgres.addToEventCounterPacket(this.producerId, consumerTime);
        return true;
    }
}

export = DataHandler;