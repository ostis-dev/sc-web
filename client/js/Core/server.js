SCWeb.core.Server = {
    _semanticNeighborhood: {
        commandId: 'ui_menu_view_full_semantic_neighborhood',
        commandAddr: null
    },
    
    _listeners: [],
    _task_queue: [], // array of server tasks
    _task_active_num: 0, // number of active tasks
    _task_max_active_num: 10, // maximum number of active tasks
    _task_timeout: 0, // timer id for tasks queue
    _task_frequency: 100,   // task timer frequency

    _current_language: null,
    _identifiers_cache: null,
    _sys_identifiers_cache: null,

    _initialize: function() {
        var expire = 1000 * 60 * 5; // five minutes expire
        this._identifiers_cache = new AppCache({
                expire: expire,
                max: 3000
        });

        this._sys_identifiers_cache = new AppCache({
                expire: expire,
                max: 3000
        });

        SCWeb.core.EventManager.subscribe("translation/changed_language", this, function(lang_addr) {
            SCWeb.core.Server._current_language = parseInt(lang_addr);
        });
    },

    /*!
     * Append new listener to server tasks
     * @param {Object} listener Listener object.
     * It must have such functions as:
     * - taskStarted - function that calls on new task started. No any arguments
     * - taskFinished - function that calls on new task finished. No any arguments
     */
    appendListener: function(listener) {
        if (this._listeners.indexOf(listener) == -1) {
            this._listeners.push(listener);
        }
    },
    
    /*!
     * Removes specified listener
     * @param {Object} listener Listener object to remove
     */
    removeListener: function(listener) {
        var idx = this._listeners.indexOf(listener);
        if (idx >= 0) {
            this._listeners.splice(idx, 1);
        }
    },
    
    /*!
     * Notify all registere listeners task started
     */
    _fireTaskStarted: function() {
        for (var i = 0; i < this._listeners.length; ++i) {
            $.proxy(this._listeners[i].taskStarted(), this._listeners[i]);
        }
    },
    
    /*!
     * Notify all registered listeners on task finished
     */
    _fireTaskFinished: function() {
        for (var i = 0; i < this._listeners.length; ++i) {
            $.proxy(this._listeners[i].taskFinished(), this._listeners[i]);
        }
    },
    
    /*!
     * Push new task for processing
     * @param {Object} task Object, that represents server task.
     * It contains properties such as:
     * - type - Type of ajax request (GET/POST)
     * - url - Url to call on server
     * - data - Object, that contains request parameters
     * - success - Callback function to call on success
     * - error - Callback function to call on error
     */
    _push_task: function(task) {
        this._fireTaskStarted();
        this._task_queue.push(task);
        
        if (!this._task_timeout) {
            var self = this;
            this._task_timeout = window.setInterval(function() {
                    var tasks = self._pop_tasks();
                    
                    for (idx in tasks) {
                        var task = tasks[idx];
                        self._task_active_num++;
                        $.ajax({
                            url: task.url,
                            data: task.data,
                            type: task.type,
                            success: task.success,
                            error: task.error,
                            complete: function() {
                                SCWeb.core.Server._fireTaskFinished();
                                self._task_active_num--;
                            }
                        });
                    }
                    
                }, this._task_frequency)
        }
    },
    
    /**
     * Get tasks from queue for processing.
     * It returns just tasks, that can be processed for that moment.
     * Number of returned tasks is min(_task_max_active_num - _task_active_num, _task_queue.length)
     */
    _pop_tasks: function() {
        var task_num = this._task_max_active_num - this._task_active_num;
        var res = [];
        for (var i = 0; i < Math.min(task_num, this._task_queue.length); ++i) {
            res.push(this._task_queue.shift());
        }
        
        if (this._task_queue.length == 0) {
            window.clearInterval(this._task_timeout);
            this._task_timeout = 0;
        }
        
        return res;
    },
    
    // ----------------------
    
    /*!
     * Get initial data from server
     *
     * @param {Function} callback Calls on request finished successfully. This function
     * get recieved data from server as a parameter
     */
    init: function(callback) {
        $.ajax({
                url: '/api/user/',
                data: null,
                type: 'GET',
                success: function(user) {
                    window.scHelper.getMainMenuCommands(window.scKeynodes.ui_main_menu).done(function(menu_commands) {
                        var data = {};
                        data['menu_commands'] = menu_commands;
                        data['user'] = user;
                        
                        window.scHelper.getLanguages().done(function(langs) {
                            data['languages'] = langs;
                            
                            window.scHelper.getOutputLanguages().done(function(out_langs) {
                                data['external_languages'] = out_langs;
                                callback(data);
                            });
                        });
                    });
                }
        });        
    },

    /*!
     *
     * @param {Array} objects List of sc-addrs to resolve identifiers
     * @param {Function} callback
     */
    resolveIdentifiers: function(objects, callback) {
        
        if (objects.length == 0) {
            callback({});
            return; // do nothing
        }

        var self = this;
        function getKey(addr) {
            return self._current_language + '/' + addr;
        }

        var result = {}, used = {}, need_resolve = [];

        for(i in objects) {
            var id = objects[i];
            
            if (used[id]) continue; // skip objects, that was processed
            used[id] = true;
            
            var cached = this._identifiers_cache.get(getKey(id));
            if (cached) {
                if (cached !== '.') {
                    result[id] = cached;
                }
                continue;
            }
            
            need_resolve.push(id);
        }
        
        if (need_resolve.length == 0) { // all results cached
            callback(result);
        } else {
            (function(result, need_resolve, callback) {
                
                var resolve_idtf = function() {
                    if (need_resolve.length == 0) {
                        callback(result);
                    } else {
                        var addr = need_resolve.shift();
                        window.scHelper.getIdentifier(parseInt(addr), self._current_language)
                            .done(function (v) {
                                if (v) {
                                    result[addr] = v;
                                    self._identifiers_cache.set(getKey(addr), v ? v : '.');
                                }

                                resolve_idtf();
                            })
                            .fail(function() {
                                resolve_idtf();
                            });
                    }
                }
                
                resolve_idtf();
                
            })(result, need_resolve, callback);
        }
    },
    
    /*! Function to initiate user command on server
     * @param {cmd_addr} sc-addr of command
     * @param {output_addr} sc-addr of output language
     * @param {arguments_list} List that contains sc-addrs of command arguments
     * @param {callback} Function, that will be called with recieved data
     */
    doCommand: function(cmd_addr, arguments_list, callback){
    
        var arguments = {};
        for (var i = 0; i < arguments_list.length; i++){
            var arg = arguments_list[i];
            arguments[i.toString() + '_'] = arg;
        }
        arguments['cmd'] = cmd_addr;
        arguments['_xsrf'] = SCWeb.core.Server.getCookie("_xsrf");
        this._push_task({
            type: "POST",
            url: "api/cmd/do/",
            data: arguments,
            success: callback
        });
    },
    
    /*! Function to get answer translated into specified format
     * @param {question_addr} sc-addr of question to get answer translated
     * @param {format_addr} sc-addr of format to translate answer
     * @param {callback} Function, that will be called with received data in specified format
     */
    getAnswerTranslated: function(question_addr, format_addr, callback)
    {
        this._push_task({
            type: "POST",
            url: "api/question/answer/translate/",
            data: { "question": question_addr, "format": format_addr, "_xsrf": SCWeb.core.Server.getCookie("_xsrf") },
            success: callback
        });
    },

    
    /*!
     * Function that resolve sc-addrs for specified sc-elements by their system identifiers
     * @param {identifiers} List of system identifiers, that need to be resolved
     * @param {callback} Callback function that calls, when sc-addrs resovled. It
     * takes object that contains map of resolved sc-addrs as parameter
     */
    resolveScAddr: function(idtfList, callback) {
        var self = this, arguments = '', need_resolve = [], result = {}, used = {};

        for (i = 0; i < idtfList.length; i++) {
            var arg = idtfList[i];
            
            var cached = this._sys_identifiers_cache.get(arg);
            if (cached) {
                result[arg] = cached;
                continue;
            }
            
            if (used[arg]) continue;
            used[arg] = true;
            
            arguments += need_resolve.length.toString() + '_=' + arg + '&';
            need_resolve.push(arg);
        }

        if (need_resolve.length == 0) {
            callback(result);
        } else {
            (function(result, arguments, need_resolve, callback) {
                arguments += '_xsrf=' + SCWeb.core.Server.getCookie("_xsrf")
                self._push_task({
                    type: "POST",
                    url: "api/addr/resolve/",
                    data: arguments,
                    success: function(addrs) {
                        for (i in need_resolve) {
                            var key = need_resolve[i];
                            var addr = addrs[key];
                            if (addr) {
                                self._sys_identifiers_cache.set(key, addr);
                                result[key] = addr;
                            }
                        }
                        callback(result);
                    }
                });
            })(result, arguments, need_resolve, callback);
        }
    },
    
    /*!
     * Function that get sc-link data from server
     * @param {Array} links List of sc-link addrs to get data
     * @param {Function} success Callback function, that recieve map of
     * resolved sc-links format (key: sc-link addr, value: format addr).
     * @param {Function} error Callback function, that calls on error
     */
    getLinksFormat: function(links, success, error) {
        var arguments = '';
        for (i = 0; i < links.length; i++){
            var arg = links[i];
            arguments += i.toString() + '_=' + arg + '&';
        }
        arguments += '_xsrf=' + SCWeb.core.Server.getCookie("_xsrf")
        this._push_task({
            type: "POST",
            url: "api/link/format/",
            data: arguments,
            success: success
        });
    },
        
    /**
     * Returns data of specified content
     * @param {String} addr sc-addr of sc-link to get data
     * @param {Function} callback Callback function, that recieve data.
     * @param {Function} error Callback function, that calls on error
     */
    getLinkContent: function(addr, success, error) {
        this._push_task({
                url: "api/link/content/",
                type: "GET",
                data: {"addr": addr, "_xsrf": SCWeb.core.Server.getCookie("_xsrf")},
                success: success,
                error: error
            });
    },
    
    /**
     * Returns list of available natural languages
     */
    getLanguages: function(callback) {
        this._push_task({
            url: "api/languages/",
            type: "GET",
            data: {"_xsrf": SCWeb.core.Server.getCookie("_xsrf")},
            success: callback
        });
    },
    
    /**
     * Setup default natular language for user
     * @param {String} lang_addr sc-addr of new language to setup
     */
    setLanguage: function(lang_addr, callback) {
        this._push_task({
            url: "api/languages/set/",
            type: "POST",
            data: {"lang_addr": lang_addr, "_xsrf": SCWeb.core.Server.getCookie("_xsrf")},
            success: callback
        });
    },

    /** 
     * Request identifiers that contains specified substring
     * @param str Substring to find
     */
    findIdentifiersSubStr: function(str, callback) {

        $.ajax({
            url: "api/idtf/find/",
            data: {"substr": str, "_xsrf": SCWeb.core.Server.getCookie("_xsrf")},
            type: "GET",
            success: callback
        });
    },

    /**
     * Request tooltip content for specified sc-elements
     */
    getTooltips: function(addrs, success, error) {
        var arguments = '';
        for (i = 0; i < addrs.length; i++){
            var arg = addrs[i];
            arguments += i.toString() + '_=' + arg + '&';
        }
        arguments += '_xsrf=' + SCWeb.core.Server.getCookie("_xsrf")
        $.ajax({
            type: "POST",
            url: "api/info/tooltip/",
            data: arguments,
            success: success,
            error: error
        });
    },

    /**
     * Get cookie attribute by attribute_name from current page
     */
    getCookie: function (attribute_name) {
        var r = document.cookie.match("\\b" + attribute_name + "=([^;]*)\\b");
        return r ? r[1] : undefined;
    }
};
