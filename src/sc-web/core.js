var express = require('express'),
    swig = require('swig'),
    api = require('./api.js'),
    view_home = require('./views/home.js'),
    config = require('./config');

exports.start = function() {
    var app = express();
    
    swig.setDefaults({ loader: swig.loaders.fs(__dirname + '/../../templates' )});
    
    app.use(express.favicon()); // returns default favicon
    app.use(express.logger('dev')); // logging requests to console
    app.use(express.static(__dirname + '/../../static')); // setup path to static files
    
    app.get("/", view_home.process);
    app.get("/api/init/", api.init);
    
    app.listen(parseInt(config.get("http:port")));
    console.log("Application started");
}
