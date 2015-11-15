SCWeb.ui.SectionPanel = {
    default_cmd_str: "ui_menu_view_decomposition",
    section_sc_addrs: [],

    /*!
     * Initialize section panel in user interface
     */
    init: function() {
        var dfd = new jQuery.Deferred();
        var self = this;
        var default_first_arg = 'ui_start_sc_element';

        this.section_container_id = '#section-window-container';
        this.section_container = $(this.section_container_id);

        SCWeb.core.EventManager.subscribe("translation/update", this, function(names) {
            self.updateTranslation(names);
        });

        SCWeb.core.Server.resolveScAddr([default_first_arg], function(addrs) {
            var argument = addrs[default_first_arg];
            window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [argument, sc_type_arc_pos_const_perm, 0])
                .done(function(res) {
                    self.doDefaultCommand([res[0][2]]);
                }).fail(function() {
                    self.doDefaultCommand([argument]);
                });
        });

        self._registerButtonHandler();
        self._registerSectionPanelHandler();

        dfd.resolve();
        return dfd.promise();
    },

    doCommand: function(cmd_addr, cmd_args) {
        var self = this;
        SCWeb.core.Server.doCommand(cmd_addr, cmd_args, function(result) {
            if (result.question != undefined) {
                self.fillSectionWindow(result.question);
            }
        });
    },

    /**
     * Initiate default user interface command (In this case, decomposition comand)
     * @param {Array} cmd_args Array of sc-addrs with command arguments
     */
    doDefaultCommand: function(cmd_args) {
        var self = this;
        SCWeb.core.Server.resolveScAddr([this.default_cmd_str], function(addrs) {
            self.default_cmd = addrs[self.default_cmd_str];
            if (self.default_cmd) {
                self.doCommand(self.default_cmd, cmd_args);
                if ($.inArray( cmd_args[0], self.section_sc_addrs ) == -1){
                    self.section_sc_addrs.push(cmd_args[0]);
                }
            }
        });
    },

    fillSectionWindow: function(question_addr) {
        var self = this;

        var ext_lang_addr = SCWeb.core.Main.getDefaultExternalLang();
        var fmt_addr = SCWeb.core.ComponentManager.getPrimaryFormatForExtLang(ext_lang_addr);

        var f = function(addr, is_struct) {
            $(self.section_container_id).html('');
            var id = SCWeb.ui.WindowManager.hash_addr(question_addr, fmt_addr);
            var window_id = 'window_' + question_addr;
            var window_html =   '<div class="panel panel-default sc-window" id="' + id + '" sc_addr="' + question_addr + '" sc-addr-fmt="' + fmt_addr + '">' +
                '<div class="panel-body" id="' + window_id + '"></div>'
            '</div>';
            self.section_container.prepend(window_html);
            var sandbox = SCWeb.core.ComponentManager.createWindowSandboxByFormat({
                format_addr: fmt_addr,
                addr: addr,
                is_struct: is_struct,
                container: window_id,
                canEdit: true
            });
        };

        var translated = function() {
            SCWeb.core.Server.getAnswerTranslated(question_addr, fmt_addr, function(d) {
                f(d.link, false);
            });
        };

        if (SCWeb.core.ComponentManager.isStructSupported(fmt_addr)) {
            // determine answer structure
            window.scHelper.getAnswer(question_addr).done(function (addr) {
                f(addr, true);
            }).fail(function(v) {
                translated();
            });
        } else
            translated();

    },

    _registerSectionPanelHandler: function() {
        var self = this;

        $(self.section_container_id).delegate(' [sc_addr]:not(div)', 'click', function() {
            var sc_addr = $(this).attr('sc_addr');
            SCWeb.core.Main.doDefaultCommand([sc_addr]);
            setTimeout(function(){
                self.doDefaultCommand([sc_addr]);
            }, 500);
        });
    },

    _registerButtonHandler: function() {
        var self = this;

        $('#previous-section-button').click(function() {
            var previous_addr = self.section_sc_addrs[self.section_sc_addrs.length-2];
            if(previous_addr != undefined) {
                self.section_sc_addrs.pop();
                self.doDefaultCommand([previous_addr]);
            }
        });


        $('#hide-section-button').click(function() {
            $(self.section_container_id).hide();
            $('#previous-section-button').hide();
            $('#hide-section-button').hide();
            $('.panel').css('margin-left','-17%');
            $('#show-section-button').show();
        });

        $('#show-section-button').click(function() {
            $(self.section_container_id).show();
            $('#previous-section-button').show();
            $('#hide-section-button').show();
            $('.panel').css('margin-left','');
            $('#show-section-button').hide();
        });

    },

    // ---------- Translation listener interface ------------
    updateTranslation: function(namesMap) {
        // apply translation
        $(this.section_container_id + ' [sc_addr]').each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            }
        });

    }

};
