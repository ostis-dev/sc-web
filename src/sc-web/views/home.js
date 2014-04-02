var swig  = require('swig');

exports.process = function(request, response) {
    response.send(swig.renderFile('base.html', {
    }));
};
