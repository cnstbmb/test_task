import Consumer = require('../rabbitApp/consumer');
import { expect } from 'chai';

let consumer = new Consumer();

describe('determinate time group', ()=>{
    it('should nothing return', ()=>{
        const result = consumer.determineTimeGroup();
        expect(result).to.equal(undefined);
    });
});