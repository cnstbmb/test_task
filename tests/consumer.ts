import Consumer = require('../rabbitApp/consumer');
import {assert} from 'chai';

describe('Проверяем работу класса Consumer, "/rabbitApp/consumer.ts"', ()=>{
    let consumer = new Consumer();

    it('Проверяем работу конструкцтора класса consumer', ()=>{
        assert.instanceOf(consumer.date, Date);
        assert.isNumber(consumer.minute);
        assert.isNumber(consumer.sec);
        assert.isNumber(consumer.msec);
        assert.isNumber(consumer.timestamp);
        assert.isNumber(consumer.timeGroup);
        assert.isAtMost(consumer.timeGroup, 12);
    });

    it('Проверяем работу функции determineTimeGroup()', ()=>{
        for(let i=0; i<=120; i++){
            consumer.minute = i;
            consumer.determineTimeGroup();
            assert.isAtMost(consumer.timeGroup, 60);
        }
    });

    it('Проверяем работу функции checkAndAutoIncrementGroup()', ()=>{
        for(let i=0; i<12; i++){
            consumer.timeGroup = i;
            consumer.checkAndAutoIncrementGroup();
            assert.equal(consumer.timeGroup, i+1);
        }
        for(let i=12; i<24; i++){
            consumer.timeGroup = i;
            consumer.checkAndAutoIncrementGroup();
            assert.equal(consumer.timeGroup, 1);
        }
    });

    it('Проверяем работу функции startReceivingMessages()', ()=>{
        let currentTimeGroup = consumer.timeGroup;
        let result = consumer.startReceivingMessages();
        assert.isObject(result);
        assert.equal(consumer.timeGroup, currentTimeGroup + 1);
    });

    it('Проверяем работу функции startSetInterval()', ()=>{
        consumer.startSetInterval();
        assert.isObject(consumer.intervalId);
    });
});