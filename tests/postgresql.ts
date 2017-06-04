import Postgresql = require('../my_modules/postgresql');
import {assert} from 'chai';

describe('Проверяем работу класса postgresql, "/my_modules/postgresql.ts"', ()=>{
    let postgresql = new Postgresql();

    it('Проверяем экземпляр класса', ()=>{
        assert.instanceOf(postgresql, Postgresql);
    });
});