import DataHandler = require('./rabbitApp/producer');
import http = require('http');
const config = require('./configs/main.json');
const shortid = require('shortid');

shortid.characters(config.shortidCharacters);
const port = process.argv[2];
const producerId: string = (shortid.generate() + '_' + port);
const server = http.createServer().listen(port);

console.log('Starting producer');
let handler = new DataHandler(producerId);

server.on('request', (request: any, response: any) => {
    handler.getData(request);
    let dataIsOk: boolean = handler.checkData();
    let message: string = dataIsOk ? 'Приняты корректные входные данные.' : 'Не корректные входные данные';
    if(dataIsOk)
        handler.sendDataToRabbit();
    response.end(message);
});