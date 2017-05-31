import {expect, assert} from 'chai';
import DataHandler = require('../rabbitApp/producer');
const shortid = require('shortid');
const config = require('../configs/main.json');
shortid.characters(config.shortidCharacters);

describe('Проверяем работу класса DataHandler, "/rabbitApp/producer.ts"', ()=>{

    const producerId: string = shortid.generate();
    let producer = new DataHandler(producerId);

    describe('Проверяем работу конструктора', ()=>{
        it('Проверяем полученный id', ()=>{
            expect(producer.producerId).to.equal(producerId);
        });
    });

    describe('Проверяем работу фукнции getData()', ()=>{
        interface incomingData{url: string}

        let testDataArray: [incomingData] = [
            {url: ''},
            {url: '  data: \' {"id":111, "group":7,  "text":”группа №seven"}\' }'},
            {url: '{ data: "" }'}
        ];

        for (let testData of testDataArray){
            it('Передали ' + JSON.stringify(testData), ()=>{
                let result: boolean = producer.getData(testData);
                assert.isUndefined(producer.query);
                assert.isTrue(producer.brokenData);
                assert.isTrue(result);
            });
        }
    });
});
