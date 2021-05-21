SCWeb.ui.IntModePanel = {
    init: function (data) {
        var dfd = new jQuery.Deferred();
        var int_mode_identifier = 'ui_int_mode';
        this.int_mode_container_id = '#' + 'int_mode_container';
        var self = this;

        SCWeb.ui.SearchPanel.intmode.init_core(dfd, data);

        SCWeb.core.Server.resolveScAddr([int_mode_identifier], function (addrs) {
            var int_mode_sc_addr = addrs[int_mode_identifier];
            if (int_mode_sc_addr) {
              SCWeb.core.Server.resolveIdentifiers([int_mode_sc_addr], function (translation) {
                  $(self.int_mode_container_id + ' label.normalLabel').
                    attr('sc_addr', int_mode_sc_addr).text(translation[int_mode_sc_addr]);

                  SCWeb.core.EventManager.subscribe("translation/update", self, self.updateTranslation);
                  SCWeb.core.EventManager.subscribe("translation/get", self, function (objects) {
                      $(self.int_mode_container_id + ' [sc_addr]').each(function (index, element) {
                          objects.push($(element).attr('sc_addr'));
                      });
                  });

                  dfd.resolve();
              });
            }
        });

        return dfd.promise();
    },

    // ---------- Translation listener interface ------------
    updateTranslation: function (namesMap) {
        // apply translation
        $(this.int_mode_container_id + ' [sc_addr]').each(function (index, element) {
            var addr = $(element).attr('sc_addr');
            if (namesMap[addr]) {
                $(element).text(namesMap[addr]);
            }
        });
    },

    updateCurrentLangugae : function() {
        var cur_lang_addr = SCWeb.core.Translation.current_lang;


    }
};
