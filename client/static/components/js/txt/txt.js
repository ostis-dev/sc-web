TextComponent = {
    formats: ['format_txt'],
    factory: function(sandbox) {
        return new TextViewer(sandbox);
    }
};

var TextViewer = function(sandbox){

    this.sandbox = sandbox;
    this.container = '#' + sandbox.container;
    
    // ---- window interface -----
    this.receiveData = function(data) {
        var dfd = new jQuery.Deferred();
        var container = $(this.container);
        var self = this;
        
        container.empty();
        
        window.sctpClient.iterate_constr(
            SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3A_A_F,
                          [sc_type_node | sc_type_const,
                           sc_type_arc_pos_const_perm,
                           self.sandbox.addr
                          ], 
                          {"x": 0}),
            SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                           [window.scKeynodes.binary_types,
                            sc_type_arc_pos_const_perm,
                            "x"
                           ])
        ).done(function(results) {
            var type_addr = results.get(0, "x");
            var str = '';

            if (type_addr == window.scKeynodes.binary_float) {
                var float32 = new Float32Array(data);
                str = float32[0];
            } else if (type_addr == window.scKeynodes.binary_int8) {
                var int8 = new Int8Arrray(data);
                str = int8[0];
            } else if (type_addr == window.scKeynodes.binary_int16) {
                var int16 = new Int16Array(data);
                str = int16[0];
            } else if (type_addr == window.scKeynodes.binary_int32) {
                var int32 = new Int32Array(data);
                str = int32[0];
            } else {
                str = ArrayBuffer2String(data);
            }
            
            /// TODO: possible doesn't need to setup binary class, when type unknown and string used
            container.addClass('sc-content-binary');
            container.text(str);
            dfd.resolve();
            
        }).fail(function() {
            container.addClass('sc-content-string');
            var string = ArrayBuffer2String(data);
            window.sctpClient.iterate_constr(
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3A_A_F,
                          [sc_type_node | sc_type_const,
                           sc_type_arc_pos_const_perm,
                           self.sandbox.addr
                          ], 
                          {"language": 0}),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                           [window.scKeynodes.languages,
                            sc_type_arc_pos_const_perm,
                            "language"
                           ]),
                SctpConstrIter(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                           [
                            "language",
                            sc_type_arc_common | sc_type_const,
                            sc_type_link,
                            sc_type_arc_pos_const_perm,
                            window.scKeynodes.nrel_language_icon,
                           ], 
                           {"icon": 2})
            ).done(function(results) {
                var identifier = results.get(0, "icon");
                string += "&nbsp;<img src='api/link/content/?addr=" + identifier + "'>";
                //TODO use text instead of html
                container.html(string);
                dfd.resolve();
            }).fail(function() {
                container.text(string);
                dfd.resolve();
            });
        }); 
        return dfd.promise();
    },

    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.updateContent('binary');
};



SCWeb.core.ComponentManager.appendComponentInitialize(TextComponent);
