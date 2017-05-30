import express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req:express.Request, res:express.Response, next:express.NextFunction) {
    res.send('respond with a resource');
});

export = router;
