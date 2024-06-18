var express = require('express');

var rank = function(objects) {
  return objects.sort((a, b) => b.rank - a.rank);
}

var jaccard = function(objects, degree) {
  objects.forEach(function(obj) {
    obj["jaccard"] = obj.rank / ( obj.degree + degree );
  });
  return objects.sort((a, b) => b.jaccard - a.jaccard);
}

var collaborative = function(objects, degree) {
  objects.forEach(function(object) {
    object["collaborative"] = object.rank / Math.min(object.degree, degree);
  });
  return objects.sort((a, b) => b.collaborative - a.collaborative);
}

var sorensen = function(objects, degree) {
  objects.forEach(function(object) {
    object["sorensen"] = 1.0 / Math.sqrt(object.degree * degree) * object.rank;
  });
  return objects.sort((a, b) => b.sorensen - a.sorensen);
}

var max_degree = function(objects, category_degrees, degree) {
  objects.forEach(function(object) {
    var weighted = object.common.reduce((sum, category) =>
      (sum + ( parseInt(object.rank) / parseInt(category_degrees[category.name]))), 0);
    object["max_degree"] = (1.0 / Math.max(parseInt(object.degree), degree)) * weighted;
  });
  return objects.sort((a, b) => b.max_degree - a.max_degree);
}

var heat_prob = function(objects, category_degrees, degree, lambda) {
  objects.forEach(function(object) {
    var weighted = object.common.reduce((sum, category) =>
      (sum + ( parseInt(object.rank) / parseInt(category_degrees[category.name]))), 0);
      object["heat_prob"] = 1.0 / (Math.pow(degree, 1.0-lambda) * Math.pow(object.degree, lambda)) * weighted
  });
  return objects.sort((a, b) => b.heat_prob - a.heat_prob);
}

var apply_filter = function(filter, objects, category_degrees, degree, limit) {
  switch (filter) {
    case 0:
      objects = rank(objects);
      break;
    case 1:
      objects = jaccard(objects, degree);
      break;
    case 2:
      objects = collaborative(objects, degree);
      break;
    case 3:
      objects = sorensen(objects, degree);
      break;
    case 4:
      objects = max_degree(objects, category_degrees, degree);
      break;
    case 5:
      objects = heat_prob(objects, category_degrees, degree, 1.0);
      break;
  }
  return objects.slice(0, limit);
}

module.exports.rank = rank;
module.exports.jaccard = jaccard;
module.exports.collaborative = collaborative;
module.exports.sorensen = sorensen;
module.exports.max_degree = max_degree;
module.exports.heat_prob = heat_prob;
module.exports.apply_filter = apply_filter;
