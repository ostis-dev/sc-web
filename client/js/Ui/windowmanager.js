SCWeb.ui.WindowManager = {
    
    // dictionary that contains information about windows corresponding to history items
    windows: [],
    window_count: 0,
    window_active_formats: {},
    sandboxes: {},
    active_window_id: null,
    active_history_addr: null,
    page_titles: [],
    question_addrs: [],
    start_page_opened: false,

    // function to create hash from question addr and format addr
    hash_addr: function(question_addr, fmt_addr) {
        return question_addr + '_' + fmt_addr;
    },
    
    init: function(params) {
        var dfd = new jQuery.Deferred();
        this.ext_langs = params.external_languages;
        
        this.window_container_id = '#window-container';
        this.window_container = $(this.window_container_id);
        
        var self = this;
        
        // external language
        var ext_langs_items = '';
        for (idx in this.ext_langs) {
            var addr = this.ext_langs[idx];
            ext_langs_items += '<li><a href="javascript:void(0)" sc_addr="' + addr + '">' + addr + '</a></li>';
        }
        $('#history-item-langs').html(ext_langs_items).find('[sc_addr]').click(function(event) {

            if (SCWeb.ui.ArgumentsPanel.isArgumentAddState()) return;

            var question_addr = self.active_history_addr;
            var lang_addr = $(this).attr('sc_addr');
        
            var fmt_addr = SCWeb.core.ComponentManager.getPrimaryFormatForExtLang(lang_addr);
            if (fmt_addr) {
                var id = self.hash_addr(question_addr, fmt_addr);
                if (self.windows.indexOf(id) != -1) {
                    self.setWindowActive(id);
                } else {
                    self.appendWindow(question_addr, fmt_addr);
                    self.window_active_formats[question_addr] = fmt_addr;
                    self.windows[self.hash_addr(question_addr, fmt_addr)] = question_addr;
                }
            }
        });
    
        $('#history-item-print').click(function () {
            if (SCWeb.ui.ArgumentsPanel.isArgumentAddState()) return;

            // get ctive window data
            var data = self.window_container.find("#" + self.active_window_id).html();
            
            var html = '<html><head>' + $('head').html() + '</head></html><body>' + data + '</body>';
            var styles = '';

            var DOCTYPE = "<!DOCTYPE html>"; // your doctype declaration
            var printPreview = window.open('about:blank', 'print_preview');
            var printDocument = printPreview.document;
            printDocument.open();
            printDocument.write(DOCTYPE +
                    '<html>' +
                        '<head>' + styles + '</head>' +
                        '<body class="print-preview">' + html + '</body>' +
                    '</html>');
            printDocument.close();
        });
        
        // listen translation events
        SCWeb.core.EventManager.subscribe("translation/update", this, this.updateTranslation);
        SCWeb.core.EventManager.subscribe("translation/get", this, function(objects) {
            $('#window-header-tools [sc_addr]').each(function(index, element) {
                objects.push($(element).attr('sc_addr'));
            });
        });
        
        dfd.resolve();
        return dfd.promise();
    },
    
    getUrlToCurrentWindow: function() {
        return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/?question=" + this.active_history_addr;
    },
    
    // ----------- History ------------
    /**
     * Append new tab into history
     * @param {String} question_addr sc-addr of item to append into history
     */
    appendHistoryItem: function(question_addr) {
                
        // get translation and create window
        var ext_lang_addr = SCWeb.core.Main.getDefaultExternalLang();
        var fmt_addr = SCWeb.core.ComponentManager.getPrimaryFormatForExtLang(ext_lang_addr);
        if (fmt_addr) {
            var id = this.hash_addr(question_addr, fmt_addr)
            if (this.windows.indexOf(id) != -1) {
                this.setWindowActive(id);
            } else {            
                this.appendWindow(question_addr, fmt_addr);
                this.window_active_formats[question_addr] = fmt_addr;
            }
        }

        this.setHistoryItemActive(question_addr);

        // setup input handlers
        var self = this;
        History.Adapter.bind(window,'statechange',function(){
            var state = History.getState();
            var window_id = state.data.window_id;
            var question_addr = state.data.question_addr;
            self.setWindowActive(window_id);
            self.setHistoryItemActive(question_addr);
        });

        // Translate added item, push new item state in browser history.
        // UI elements, such as menu-items, scn-elements, etc. contains <a href='#'></a> and each
        // agent call provide GET request and change URL with adding # symbol at the end. Also,
        // result of such GET request automatically pushes into browser history and it's state need to be replaced.
        $.when(SCWeb.core.Translation.translate([ question_addr ])).done(function(namesMap) {
            value = namesMap[question_addr];
            if (value){
                // Replace state for start page. Don't save question title and change document title,
                // because main page title is unchangeable ("OSTIS" title). URL stay the same.
                if (history.length == 1 && !self.start_page_opened){
                    History.replaceState({window_id: self.active_window_id, question_addr:question_addr}, null, "");
                    self.start_page_opened = true;
                    return;
                }
                // Check, if GET request already was called by <a href='#'></a> and current URL ends with '#'
                // then replace state of GET request, else push new state in history. Change URL.
                if (document.URL.slice(-1) === '#') {
                    History.replaceState({window_id: self.active_window_id, question_addr:question_addr}, null, self.getUrlToCurrentWindow());
                } else {
                    History.pushState({window_id: self.active_window_id, question_addr:question_addr}, null, self.getUrlToCurrentWindow());
                }
                // Save question_addr and title for current page
                self.page_titles[question_addr] = value;
                self.question_addrs.push(question_addr);
                document.title = value;
            }
        });
    },

    /**
     * Set new active history item
     * @param {String} addr sc-addr of history item
     */
    setHistoryItemActive: function(addr) {
        this.active_history_addr = addr;

        if (this.page_titles[addr]) {
            document.title = this.page_titles[addr];
        }
    },


    // ------------ Windows ------------
    /**
     * Append new window
     * @param {String} addr sc-addr of sc-structure
     * @param {String} fmt_addr sc-addr of window format
     */
    appendWindow: function(question_addr, fmt_addr) {
        var self = this;

        var f = function(addr, is_struct) {
            var id = self.hash_addr(question_addr, fmt_addr);
            var window_id = 'window_' + question_addr;
            var window_html =   '<div class="panel panel-default sc-window" id="' + id + '" sc_addr="' + question_addr + '" sc-addr-fmt="' + fmt_addr + '">' +
                                    '<div class="panel-body" id="' + window_id + '"></div>'
                                '</div>';
            self.window_container.prepend(window_html);

            if ( $('#hide-section-button').css('display') == 'none' ){
                $('.panel').css('margin-left','-17%');
            }

            self.hideActiveWindow();
            self.windows.push(id);

            var sandbox = SCWeb.core.ComponentManager.createWindowSandboxByFormat({
                format_addr: fmt_addr,
                addr: addr,
                is_struct: is_struct,
                container: window_id,
                canEdit: true    //! TODO: check user rights
            });
            if (sandbox) {
                self.sandboxes[question_addr] = sandbox;
                self.setWindowActive(id);
            } else {
                self.showActiveWindow();
                throw "Error while create window";
            };
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

    /**
     * Remove specified window
     * @param {String} addr sc-addr of window to remove
     */
    removeWindow: function(id) {
        this.window_container.find("[sc_addr='" + addr + "']").remove();
    },

    /**
     * Makes window with specified addr active
     * @param {String} addr sc-addr of window to make active
     */
    setWindowActive: function(id) {
        this.hideActiveWindow();

        this.active_window_id = id;
        this.showActiveWindow();
    },

    hideActiveWindow: function() {
        if (this.active_window_id)
            this.window_container.find("#" + this.active_window_id).addClass('hidden');
    },

    showActiveWindow: function() {
        if (this.active_window_id)
            this.window_container.find("#" + this.active_window_id).removeClass('hidden');
    },

    /*!
     * Genarate html for new window container
     * @param {String} containerId ID that will be set to container
     * @param {String} controlClasses Classes that will be added to controls
     * @param {String} containerClasses Classes that will be added to container
     * @param {String} addr sc-addr of window
     */
    generateWindowContainer: function(containerId, containerClasses, controlClasses, addr) {

        return '<div class="sc-content-wrap" id="' + containerId + '_wrap"> \
                    <div class="sc-content-controls ' + controlClasses + '" sc_addr="' + addr + '"> </div> \
                    <div id="' + containerId + '" class="sc-content ' + containerClasses + '"> </div> \
                </div>';
    },

    /**
     * Create viewers for specified sc-links
     * @param {Object} containers_map Map of viewer containers (key: sc-link addr, value: id of container)
     */
    createViewersForScLinks: function(containers_map) {
        var dfd = new jQuery.Deferred();

        var linkAddrs = [];
        for (var cntId in containers_map)
            linkAddrs.push(containers_map[cntId]);

        if (linkAddrs.length == 0) {
            dfd.resolve();
            return dfd.promise();
        }

        (function(containers_map) {
            SCWeb.core.Server.getLinksFormat(linkAddrs,
                function(formats) {

                    var result = {};

                    for (var cntId in containers_map) {
                        var addr = containers_map[cntId];
                        var fmt = formats[addr];
                        if (fmt) {
                            var sandbox = SCWeb.core.ComponentManager.createWindowSandboxByFormat({
                                format_addr: fmt,
                                addr: addr,
                                is_struct: false,
                                container: cntId,
                                canEdit: false
                            });
                            if (sandbox) {
                                result[addr] = sandbox;
                            }
                        }
                    }

                    dfd.resolve(result);
                },
                function() {
                    dfd.reject();
                }
            );
        })(containers_map);

        return dfd.promise();
    },

    /** Create viewers for specified sc-structures
     * @param {Object} containers_map Map of viewer containers (id: id of container, value: {key: sc-struct addr, ext_lang_addr: sc-addr of external language}})
     */
    createViewersForScStructs: function(containers_map) {
        var res = {};
        for (var cntId in containers_map) {
            if (!containers_map.hasOwnProperty(cntId))
                continue;

            var info = containers_map[cntId];
            res[cntId] = SCWeb.core.ComponentManager.createWindowSandboxByExtLang({
                ext_lang_addr: info.ext_lang_addr,
                addr: info.addr,
                is_struct: true,
                container: cntId,
                canEdit: false
            });
        }
        return res;
    },


    // ---------- Translation listener interface ------------
    updateTranslation: function(namesMap) {
        var self = this;
        // apply translation
        $('#window-header-tools [sc_addr]:not(.btn)').each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            }
        });

        //translate all question addrs on change language, save new text values and change title
        $.when(SCWeb.core.Translation.translate(self.question_addrs)).done(function(namesMap) {
            $.each(self.question_addrs, function (index, question_addr) {
                if (namesMap[question_addr]) {
                    self.page_titles[question_addr] = namesMap[question_addr];
                }
            });
            var current_title = self.page_titles[self.active_history_addr];
            // Check current title existence
            if (current_title){
                document.title = current_title;
            }
        });
    },
};
