var cors = require('cors')
var express = require('express');
var bodyParser = require('body-parser');

var app = module.exports = express();

var port = process.env.PORT || 8087;

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/musicnodes', require('./api/musicnodes_a'));

app.listen(port, function () {
  console.log('MusicNodes server listening on port ' + port + '!')
});
