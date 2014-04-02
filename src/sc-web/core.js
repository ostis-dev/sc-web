var express = require('express'),
    swig = require('swig'),
    view_home = require('./views/home.js');

exports.start = function(config) {
    var app = express();
    
    swig.setDefaults({ loader: swig.loaders.fs(__dirname + '/../templates' )});
    
    app.get("/", view_home.process);
    
    app.listen(parseInt(config.get("http:port")));
    console.log("Application started");
}
