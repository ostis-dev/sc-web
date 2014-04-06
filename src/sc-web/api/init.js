var sctp_client = require('../sctp/sctp'),
    sc_types = require('../sctp/types');

exports.func = function(request, response) {
    var client = sctp_client.create();
    
    var addr = new sc_types.ScAddr(32000);
    console.log(addr);
    console.log(client.check_element(addr));
    response.send('test');
};
