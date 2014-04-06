var conf = require('../config'),
    types = require('./types'),
    bin = require('./binary'),
    net = require('net')
    

var header_size = 10;

sctp_client = function(socket) {
    return (function(socket) {
        var self = this;
        this.data = new Buffer(0);
        
        this.bp = new bin.BinaryParser(false, true);
        this.socket = socket;
        
        this.socket.on('data', function(data) {
            self.data = Buffer.concat([self.data, data]);
            console.log(self.data);
        });
        
        this.socket.on('end', function() {
            console.log("Disconnect from " + self.host + ":" + self.port);
        });
        
        
        this.check_element = function(addr) {
            
            var params = new Buffer(4);
            params.writeUInt32LE(addr.value, 0);
            var header = new Buffer(header_size + params.length);
            header.writeInt8(types.SCTP_CMD_CHECK_ELEMENT, 0);
            header.writeInt8(0, 1);
            header.writeUInt32LE(0, 2);
            header.writeUInt32LE(4, 6);
            self.socket.write(Buffer.concat([header, params]));
            
            
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
        
        return this;
    })(socket);
}

exports.create = function() {
    return (function(host, port) {
            
            this.host = host;
            this.port = port;
            
            this.client = new sctp_client(net.connect({ port: this.port, host: this.host}, function() {
                                        console.log("Connected to " + host + ":" + port);
                                        }));
                                        
            this.check_element = this.client.check_element;
            this.get_element_type = this.client.get_element_type;
            this.erase_element = this.client.erase_element;
            this.create_node = this.client.create_node;
            this.create_link = this.client.create_link;
            this.create_arc = this.client.create_arc;
            this.get_arc_source = this.client.get_arc_source;
            this.get_arc_target = this.client.get_arc_target;
            this.get_link_content = this.client.get_link_content;
            this.set_link_content = this.client.set_link_content;
            this.find_links_with_content = this.client.find_links_with_content;
            this.iterate_elements = this.client.iterate_elements;
            this.find_element_by_system_identifier = this.client.find_element_by_system_identifier;
            this.set_system_identifier = this.client.set_system_identifier;
            this.get_statistics = this.client.get_statistics;
                                        
            return this;
            
        })(conf.get('sctp:host'), parseInt(conf.get('sctp:port')));
}
