var express = require('express');
var router = express.Router();

/* GET home page. */

router.post('/callback', function(req, res) {
	console.log('called back', req.body);
	console.log('called back 2', req.body['content']);
	res.send("OK");
});

module.exports = router;
