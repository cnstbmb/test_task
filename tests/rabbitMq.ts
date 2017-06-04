import RabbitMq = require('../my_modules/rabbitMq');
import {assert} from 'chai';

describe('Проверяем работу класса rabbit, "/my_modules/rabbitMq.ts"', ()=>{
    let rabbit = new RabbitMq();

    it('Проверяем экземпляр класса', ()=>{
        assert.instanceOf(rabbit, RabbitMq);
    });
});