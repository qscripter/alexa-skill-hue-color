//var request = require('request');
var fuse = require('./fuse.js');
var colors = require('./colors.js');
var _ = require('lodash');


function matchColor(speech) {
  var match;
  var options = {
    keys: ['name'],
    id: 'name',
    threshold: 0.4,
    includeScore: true
  };
  var f = new fuse(colors.colors, options);
  var result = f.search(speech);

  var exactMatches = _.filter(result, function (item) {
    return item.score === 0;
  });

  if (exactMatches.length) {
    match = _.filter(exactMatches, function (match) {
      return match.item.length === speech.length;
    })[0].item;
  } else if (result.length) {
    match = result[0].item;
  }

  return match;
}

console.log(matchColor('blue'));
console.log(matchColor('red'));
console.log(matchColor('orange'));
console.log(matchColor('burnt orange'));
console.log(matchColor('aqua'));
console.log(matchColor('teal'));
console.log(matchColor('light blue'));
console.log(matchColor('white'));