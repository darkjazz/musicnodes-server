var express = require('express');
var st = require('./modules/static');

var module_mn = express.Router();

module_mn.get('/search/:term', async function(req, res) {
  var term = req.params.term;
  var result = await st.search(term);
  res.send(result);
});

module_mn.get('/track/:id', async function(req, res) {
  var id = req.params.id;
  var result = await st.get_track(id);
  res.send(result);
});

module_mn.get('/graph/:id/:filter/:includeWiki/:limit/:featureLimit', async function(req, res) {
  var id = req.params.id;
  var filter = parseInt(req.params.filter);
  var limit = parseInt(req.params.limit);
  var featureLimit = parseInt(req.params.featureLimit);
  var includeWiki = (req.params.includeWiki == "true");
  var result = await st.create_graph(id, filter, includeWiki, limit, featureLimit);
  res.send(result);
});

module.exports = module_mn;
