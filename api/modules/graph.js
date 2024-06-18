const link_limit = 3;

const feature_categories = {
  "rhythm": "Rhythm",
  "tonality": "Tonality",
  "instrumentation": "Instrumentation",
  "composite": "Audio Features",
  "lastfm": "Crowd Tags"
};

var get_group_name = function(category) {
  var name = category.name;
  if (category.type == "wiki category") {
    name = "Other Tracks By " + category.name;
  }
  if (category.name in feature_categories) {
    name = "Similar Tracks By " + feature_categories[category.name];
  }
  if (category.type == "bbc genre") {
    name = "Other " + category.name + " Tracks"
  }
  if (category.type.includes("tv program")) {
    name = "Other Tracks From " + category.name.replace("_", " ") + " TV Programs"
  }
  return name;
}

var group_tracks = function(tracks, categories, sorted_categories) {
  var grouped_tracks = {};
  var graph = { "nodes": [], "links": [], "tracks": { }, "groups": { } };
  sorted_categories.forEach(_name => {
    var _category = categories.find(_cat => _name == _cat.name);
    if (_category) {
      if (!(sorted_categories.indexOf(_name) in graph.groups))
        graph.groups[sorted_categories.indexOf(_name)] = get_group_name(_category);
      _category.ids.forEach(_id => {
        if (!(_id in grouped_tracks)) {
          var _rank, _title, _performer;
          grouped_tracks[_id] = _category;
          _track = tracks.find(_tr => _tr.id == _id);
          if (_track) {
            graph.nodes.push({ 'id': _track.id, "group": sorted_categories.indexOf(_name) });
            graph.tracks[_id] = {
              "title": _track.title,
              "performer": _track.performer,
              "group": sorted_categories.indexOf(_name),
              "category": _category.name + " " + _category.type,
              "rank": _track.rank,
              "id": _id
            }
          }
        }
      });
    }
  });
  return graph;
}

var add_link = function(idA, idB, links) {
  return (links[idA] < link_limit && links[idB] < link_limit);
}

var link_tracks = function(graph, id, tracks, categories, sorted_categories) {
  var links = { }
  tracks.forEach((_track, _index) => {
    if (_index > 0) {
      graph.links.push({
        source: tracks[_index-1].id,
        target: _track.id,
        value: 1.0
      })
    }
    links[_track.id] = 1
  });
  categories.forEach(_cat => {
    _cat.ids.slice(1).forEach((_idB, _index) => {
      _idA = _cat.ids[_index-1];
      if (!(id == _idA || id == _idB) && _idA in tracks && _idB in tracks ) {
        graph.links.push({
          source: _cat.ids[_index-1],
          target: _id,
          value: 1.0
        });
        links[_idA] += 1;
        links[_idB] += 1;
      }
    });
  });
  tracks.forEach(_trackA => {
    tracks.forEach(_trackB => {
      if (_trackA.id != _trackB.id) {
        sorted_categories.forEach(_category => {
          _catA = _trackA.common.find(_common => _category == _common.name);
          _catB = _trackB.common.find(_common => _category == _common.name);
          if (_catA && _catB && add_link(_trackA.id, _trackB.id, links) ) {
            graph.links.push({
              source: _trackA.id,
              target: _trackB.id,
              value: 1.0
            });
            links[_trackA.id] += 1;
            links[_trackB.id] += 1;
          }
        })
      }
    })
  });
  return graph;
}

module.exports.create_graph = function(tracks, id, categories, category_degrees) {
  var sorted_categories = Object.keys(category_degrees).sort(
      (a, b) => category_degrees[a] - category_degrees[b]
  );
  var graph = group_tracks(tracks, categories, sorted_categories);
  return link_tracks(graph, id, tracks, categories, sorted_categories);
}
