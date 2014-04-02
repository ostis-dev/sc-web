var conf = require('../config'),
    types = require('./types'),
    bin = require('./binary'),
    net = require('net')

exports.create = function() {
    return (function(host, port) {
            
            this.host = host;
            this.port = port;
            
            var self = this;
            this.chunk = '';
            
            this.bp = bin.BinaryParser(true, true);
            this.socket = net.connect({ port: this.port, host: this.host}, function() {
                console.log("Connected to " + host + ":" + port);
            });
            
            this.socket.on('data', function(data) {
                self.chunk += data;
                
                
            });
            
            this.socket.on('end', function() {
                console.log("Disconnect from " + self.host + ":" + self.port);
            });
            
            
            this.check_element = function(addr) {
                
                
                
            };
            
            this.get_element_type = function(addr) {
            };
            
            this.erase_element = function(addr) {
            };
            
            this.create_node = function(type) {
            };
            
            this.create_link = function() {
            };
            
            this.create_arc = function(type, source, target) {
            };
            
            this.get_arc_source = function(addr) {
            };
            
            this.get_arc_target = function(addr) {
            };
            
            this.get_link_content = function(addr) {
            };
            
            this.set_link_content = function(addr, data) {
            };
            
            this.find_links_with_content = function(data) {
            };
            
            this.iterate_elements = function(iterator_type, args) {
            };
            
            this.find_element_by_system_identifier = function(data) {
            };
            
            this.set_system_identifier = function(addr, data) {
            };
            
            this.get_statistics = function(beg_time, end_time) {
            };
            
            
        })(conf.get('sctp:host'), parseInt(conf.get('sctp:port')));
}
