import {expect, assert} from 'chai';
import DataHandler = require('../rabbitApp/producer');
const shortid = require('shortid');
const config = require('../configs/main.json');
shortid.characters(config.shortidCharacters);

describe('Проверяем работу класса DataHandler, "/rabbitApp/producer.ts"', ()=>{

    const producerId: any = shortid.generate();
    let producer = new DataHandler(producerId);

    describe('Проверяем работу конструктора', ()=>{
        it('Проверяем полученный id', ()=>{
            expect(producer.producerId).to.equal(producerId);
        });
    });

    describe('Проверяем работу фукнций getData(); checkData(); checkJSON(); sendDataToRabbit()', ()=>{

        let testDataArray: [any] = [
            '',
            {},
            [],
            {url: null},
            {url: undefined},
            {url: 0},
            {url: []},
            {url: {}},
            {url: ''},
            {url: 'data=%20{%22id%22:111,%20%22group%22:7,%20%20%22text%22:%E2%80%9D%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0%20%E2%84%96three%22}'},
        ];

        for (let testData of testDataArray){
            it('Передали ' + JSON.stringify(testData), ()=>{
                let result: boolean = producer.getData(testData);
                assert.isUndefined(producer.query);
                assert.isTrue(producer.brokenData);
                assert.isTrue(result);
            });

            it('Проверяем функцию checkJSON()', ()=>{
                let result: boolean = producer.checkData();
                assert.isFalse(result);
            });

            it('Проверяем функцию sendDataToRabbit()',()=>{
                let result: boolean = producer.sendDataToRabbit();
                assert.isFalse(result);
            });
        }

        it('Передали корректные данные', ()=>{
            let testData = {url: '/?data=%20{%22id%22:111,%20%22group%22:7,%20%20%22text%22:%E2%80%9D%D0%B3%D1%80%D1%83%D0%BF%D0%BF%D0%B0%20%E2%84%96three%22}'}
            let result: boolean = producer.getData(testData);
            assert.isString(producer.query);
            assert.isFalse(result);
        });

        it('Проверяем функцию checkJSON()', ()=>{
            let result: boolean = producer.checkData();
            assert.isTrue(result);
        });

        it('Проверяем функцию sendDataToRabbit()',()=>{
            let result: boolean = producer.sendDataToRabbit();
            assert.isTrue(result);
        });
    });
});
