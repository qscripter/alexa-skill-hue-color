var request = require('request');
var fuse = require('fuse.js');

var books = [{
  id: 1,
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald'
},{
  id: 2,
  title: 'The DaVinci Code',
  author: 'Dan Brown'
},{
  id: 3,
  title: 'Angels & Demons',
  author: 'Dan Brown'
}];

var options = {
  keys: ['author', 'title'],   // keys to search in
  id: 'id'                     // return a list of identifiers only
};
var f = new fuse(books, options);
var result = f.search('brwn'); // Fuzzy-search for pattern 'brwn'

console.log(result);

function postColor(color) {
    console.log(color);
    request.post({
        url: 'https://maker.ifttt.com/trigger/hue_color_change/with/key/dUx1De2fiVVHUKial8Qtkc',
        json: true,
        body: {
            'value1': color
        }
    });
}



postColor('blue');