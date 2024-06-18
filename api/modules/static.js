const jf = require('jsonfile');
const fi = require("./filter")
const gr = require("./graph")

var data = {}

jf.readFile("data/mnmb.json", function(err, obj) {
  if (err) console.log(err);
  data = obj;
  console.log("data loaded ..");
});

var get_categories = function(id) {
  var categories = [];
  Object.values(data["wiki"]).forEach(_category => {
    if (_category.ids.includes(id))
      categories.push(_category)
  });
  return categories;
}

var collect_id_degrees = function(ids) {
  for (let _id of Object.keys(ids)) {
    _id_obj = ids[_id];
    if (_id in data["degrees"])
      _id_obj.degree = data["degrees"][_id];
  }
  return ids;
}

var collect_track_titles = function(tracks) {
  for (let _track of tracks) {
    _tr = data["tracks"][_track.id];
    if (_tr) {
      _track.title = _tr.title;
      _track.performer = _tr.performer;
    }
  }
  return tracks;
}

var collect_ids = function(id, categories, ids) {
  if (ids === undefined)
    ids = { };
  categories.forEach((_category) => {
    _category.ids.forEach((_id) => {
      if (id != _id) {
        if (!(_id in ids)) {
          ids[_id] = {
            'id': _id,
            'rank': 1,
            'common': [
              {
                'name': _category.name,
                'degree': _category.ids.length
              }
            ]
          }
        }
        else {
          ids[_id]['rank'] += 1;
          _common = ids[_id]['common'].find(_find_common => _find_common.name == _category.name);
          if (!_common)
            ids[_id]['common'].push({
              'name': _category.name,
              'degree': _category.ids.length
            });
        }
      }
    })
  });
  return collect_id_degrees(ids);
}

var get_category_degrees = function(categories) {
  category_degrees = { }
  categories.forEach((_category) => {
    category_degrees[_category.name] = _category.ids.length;
  });
  return category_degrees;
}

module.exports.search = function(term) {
  var results = [];
  Object.values(data["tracks"]).forEach(_tr => {
    if (_tr.title.toLowerCase().includes(term) || ("performer" in _tr && _tr.performer.toLowerCase().includes(term)))
      results.push({ "id": _tr.id, "title": _tr.title, "performer": _tr.performer });
  });
  return results;
}

module.exports.get_track = function(id) {
  try {
    var track = data["tracks"][id];
    return track;
  }
  catch(error) {
    console.log(error);
    return error;
  }
}

module.exports.create_graph = function(id, filter, includeWiki, limit, featureLimit) {
  try {
    var categories, degree, ids, category_degrees, tracks;
    if (includeWiki) {
      categories = get_categories(id);
      degree = categories.length;
      ids = collect_ids(id, categories);
      category_degrees = get_category_degrees(categories);
      tracks = [];
      Object.keys(ids).forEach((_id) => {
        tracks.push(ids[_id]);
      });
      tracks = fi.apply_filter(filter, tracks, category_degrees, degree, limit);
      var remaining_ids = tracks.map(_track => _track.id);
      Object.keys(ids).forEach(_id => {
        if (!(_id in remaining_ids))
          delete ids[_id];
      });
    }
    else {
      category_degrees = { };
      categories = [ ];
      tracks = [ ];
    };
    var feature_categories = data["features"][id];
    feature_categories.forEach(_fcat => {
      _fcat["ids"] = _fcat["ids"].slice(0, featureLimit);
    });
    ids = collect_ids(id, feature_categories, ids);
    feature_categories.forEach(_category => {
      category_degrees[_category.name] = featureLimit;
      categories.push(_category);
    });
    Object.keys(ids).forEach((_id) => {
      var _track = tracks.find(_tr => _tr.id == _id );
      if (!_track) {
        tracks.push(ids[_id]);
      }
    });
    tracks = collect_track_titles(tracks);
    return gr.create_graph(tracks, id, categories, category_degrees);
  }
  catch(error) {
    console.log("error", error)
    return error;
  }
}
