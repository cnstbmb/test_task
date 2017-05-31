/**
 * Created by cnstbmb on 31.05.2017.
 */
import Consumer = require('./rabbitApp/consumer');

let consumer = new Consumer();
consumer.startReceivingMessages();
