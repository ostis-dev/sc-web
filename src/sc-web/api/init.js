var sctp_client = require('../sctp/client');

exports.func = function(request, response) {
    var client = sctp_client.create();
    response.send('test');
};
