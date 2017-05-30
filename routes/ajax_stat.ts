import Postgres = require('../my_modules/postgresql');
import express = require('express');

const postgres = new Postgres();
const router = express.Router();

/* GET json data. */
router.get('/', function(req:express.Request, res:express.Response, next:express.NextFunction) {
    console.log('ajax_stat отработал гет');
    postgres.getRabbitEventsData(
        (data)=>{
                let jsonData: string = JSON.stringify(data);
                res.send(jsonData);
            });
});

export = router;
