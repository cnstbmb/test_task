import { expect } from 'chai';
import DataHandler = require('../rabbitApp/producer');
const shortid = require('shortid');
const config = require('../configs/main.json');
shortid.characters(config.shortidCharacters);

const producerId: string = shortid.generate();
let producer = new DataHandler(producerId);
