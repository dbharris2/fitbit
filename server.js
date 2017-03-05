var express = require('express');
var fs = require( 'fs' );
var path = require('path');

var app = express();
app.set('port', (process.env.PORT || 8080));

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
