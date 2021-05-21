const searchByKeyWord = (event, item) => {
    if (item.group === 'intmode') {
        SCWeb.ui.SearchPanel.intmode.run_question(item);
    } else if (item.addr) {
        SCWeb.core.Main.doDefaultCommand([item.addr]);
    } else {
        searchByIdentifier(item);
    }
    event.stopPropagation();
    $('.typeahead').val('');
    $('.tt-dropdown-menu').hide();
};

const searchByIdentifier = (identifier) => {
    SCWeb.core.Server.resolveScAddr([identifier], function (addrs) {
        SCWeb.core.Main.doDefaultCommand([addrs[identifier]]);
    });
}

SCWeb.ui.SearchPanel = {
    init: function () {
        var dfd = new jQuery.Deferred();
        var self = this;

        var keynode_nrel_main_idtf = null;
        var keynode_nrel_idtf = null;
        var keynode_nrel_system_idtf = null;

        $('.typeahead').typeahead({
                minLength: 3,
                highlight: true,
            },
            {
                name: 'idtf',
                source: function (query, cb) {
                    $('#search-input').addClass('search-processing');
                    // TODO implement for rocksdb
                    keys = [];
                    
                    var nonintsearch = function() {
                        SCWeb.core.Server.findIdentifiersSubStr(query, function (data) {
                            var addValues = function (key) {
                                var list = data[key];
                                if (list) {
                                    for (idx in list) {
                                        var value = list[idx]
                                        keys.push({name: value[1], addr: value[0], group: key});
                                    }
                                }
                            }

                            addValues('sys');
                            addValues('main');
                            addValues('common');

                            cb(keys);
                            $('#search-input').removeClass('search-processing');
                        })
                    };

                    if (SCWeb.core.IntModeEnabled) {
                        var intmode = SCWeb.ui.SearchPanel.intmode;

                        if (intmode.timer !== null)
                            window.clearTimeout(intmode.timer);
                        
                        intmode.timer = window.setTimeout(() => {
                            intmode.process(keys, query, nonintsearch);
                        }, intmode.timeout_time);
                    } else
                        nonintsearch();
                },
                displayKey: 'name',
                templates: {
                    suggestion: function (item) {

                        //glyphicon glyphicon-globe
                        var html = '';
                        if (item.group === 'common') {
                            return '<p class="sc-content">' + item.name + '</p>';
                        } else if (item.group === 'intmode') {                            
                            return '<p><span class="tt-suggestion-icon glyphicon glyphicon-education"></span>' + item.title + '</p>';
                        } else {
                            var cl = 'glyphicon glyphicon-user';
                            if (item.group === 'sys') {
                                cl = 'glyphicon glyphicon-globe';
                            }
                            return '<p><span class="tt-suggestion-icon ' + cl + '"></span>' + item.name + '</p>';
                        }
                    }
                }
            }
        ).bind('typeahead:selected', function (event, item, dataset) {
            searchByKeyWord(event, item);
        }).keypress(function (event) {
            if (event.which === 13) {
                searchByKeyWord(event, $('#search-input').val());
            }
        });

        SCWeb.core.Server.resolveScAddr(['nrel_main_idtf', 'nrel_idtf', 'nrel_system_identifier'], function (addrs) {
            keynode_nrel_main_idtf = addrs['nrel_main_idtf'];
            keynode_nrel_idtf = addrs['nrel_idtf'];
            keynode_nrel_system_idtf = addrs['nrel_system_identifier'];

            dfd.resolve();
        });

        return dfd.promise();
    },
    
    intmode : {
        timer : null,
        timeout_time : 1000,
        languagesSysIdtfs : {},
        modules : {},
        enabled_modules : [],
        precalculated_modules_info : {
            /*module_name : {
                lang_ru : true, //do run on this language
                lang_en : false,
                ...
            }*/
        },
        cache : {
            /*url : {
                is_processed : true,
                url : "",
                module_name : "",
                response : {
                    entities : {
                        entity_name : [
                            {
                                value : ""
                            }
                        ]
                    },

                    intents : [
                        {
                            intent : "",
                            confidence : 0.0
                        }
                    ]
                }
            }*/
        },
        questions_addrs : {},
        special_addrs : {
            nothing_found : {
                idtf : "ui_int_mode_nothing_found",
                addr : null
            }
        },
        current_lang_idtf : null,

        init_core : function(dfd, data) {
            var get_sys = function (addr) {
                scHelper.getSystemIdentifier(addr)
                    .done(function (res) {
                        SCWeb.ui.SearchPanel.intmode.languagesSysIdtfs[res] = addr;
    
                        dfd.resolve(res);
                    })
                    .fail(function () {
                        dfd.reject();
                    });
            };
    
            data.languages.forEach(function(lang_addr) {
                get_sys(lang_addr);
            });

            //check what modules are to be enabled
            var intmode = SCWeb.ui.SearchPanel.intmode;
            var flag_elements_to_check = [];
            var flags_and_modules = {};
        
            for (var module_name in intmode.modules) {
                var flag_element = intmode.modules[module_name].flag_element;

                if (flag_element === "")
                    intmode.enabled_modules.push(module_name);
                else {
                    flag_elements_to_check.push(flag_element);
                    flags_and_modules[flag_element] = module_name;
                }
            }

            SCWeb.core.Server.resolveScAddr(flag_elements_to_check, function(addrs) {
                flag_elements_to_check.forEach(function(flag_element) {
                    if (addrs[flag_element] !== undefined)
                        intmode.enabled_modules.push(flags_and_modules[flag_element]);
                    else
                        console.warn("[IntMode] The module '" + flags_and_modules[flag_element] +
                         "' was disabled because flag element `" + flag_element + "` doesn't exist"); 
                });

                console.log("[IntMode] Enabled modules are: " + intmode.enabled_modules);

                //add question defaults
                intmode.enabled_modules.forEach(function(module_name) {
                    var module = intmode.modules[module_name];

                    for (var def in module.question_defaults) {
                        module.questions.forEach(function(question) {
                            question[def] = module.question_defaults[def];
                        });
                    }
                });

                //extract addrs of all the question idtfs
                var questions_idtfs = [];
                var questions_idtfs_and_questions = {};
    
                //warn: what if there're two questions (potential;y from diff. modules) which share the same name
                intmode.enabled_modules.forEach(function(module_name) {
                    intmode.modules[module_name].questions.forEach(function(question) {
                        if (question.flags.is_enabled) {
                            questions_idtfs.push(question.question_idtf);
                            questions_idtfs_and_questions[question.question_idtf] = question;
                        }
                    });
                });
    
                SCWeb.core.Server.resolveScAddr(questions_idtfs, function(addrs) {
                    questions_idtfs.forEach(function(question_idtf) {
                        if (addrs[question_idtf] !== undefined)
                            intmode.questions_addrs[question_idtf] = addrs[question_idtf];
                        else {
                            questions_idtfs_and_questions[question_idtf].flags.is_enabled = false;
    
                            console.warn("[IntMode] The question with `question_idtf`=" + question_idtf +
                                 " was disabled because the idtf doesn't exist");
                        }
                    });
    
                    //fill in precalculated modules info
                    intmode.enabled_modules.forEach(function(module_name) {
                        var info = {};

                        //by default don't run requests at all
                        for (var lang in intmode.modules[module_name].url_prefixes) {
                            info[lang] = false;
                        }

                        //if there's at least one not disabled question then run requests for this lang
                        intmode.modules[module_name].questions.forEach(function(question) {
                            if (question.flags.is_enabled)
                                info[question.lang] = true;
                        });

                        intmode.precalculated_modules_info[module_name] = info;
                    });

                    var nothing_found_idtf = intmode.special_addrs.nothing_found.idtf;
                    SCWeb.core.Server.resolveScAddr([nothing_found_idtf], function(addrs) {
                        if (addrs[nothing_found_idtf] !== undefined) {
                            intmode.special_addrs.nothing_found.addr = addrs[nothing_found_idtf];
                        } else
                            console.error("[IntMode] Couldn't find `" + nothing_found_idtf + "`. Badbad");

                        dfd.resolve();
                    });
                });
            });
        },

        process : function(keys, query, callback) {
            var dfd = new jQuery.Deferred();
            var intmode = SCWeb.ui.SearchPanel.intmode;

            //get current language and its sys_idtf
            //for each module:
            //  get according url prefix
            //  send request (if result isn't already in the cache)
            //  extract all intents (only if confidence fits) and all the pairs "entity_id=>value"
            //  save them into general arr of values and to map which associates values with module
            //load addrs for that arr
            //save everything to cache
            //check all available questions for current language
            var current_lang_idtf = null;
            var current_lang = SCWeb.core.Translation.current_lang;

            for (var lang in intmode.languagesSysIdtfs) {
                if (intmode.languagesSysIdtfs[lang] === current_lang) {
                    current_lang_idtf = lang;

                    break;
                }
            }

            intmode.current_lang_idtf = current_lang_idtf;
            
            if (current_lang_idtf !== null) {
                var requests_to_make = [];

                intmode.enabled_modules.forEach(function(module_name) {
                    var module_info = intmode.precalculated_modules_info[module_name];

                    //[current_lang] can be undefined
                    if (module_info[current_lang_idtf] === true) {
                        requests_to_make.push({
                            module_name : module_name,
                            url_prefix : intmode.modules[module_name].url_prefixes[current_lang_idtf],
                            token : intmode.modules[module_name].tokens[current_lang_idtf]
                        });
                    }
                });

                var results = {};

                intmode.make_request(results, requests_to_make, query, function(results) {
                    intmode.process_results(results, callback, keys);
                });
            } else
                console.warn("[IntMode] Int mode won't start beacause there're no languages at all!");
        },

        //if the requests would be running in parallel that would be cool
        make_request : function(results, remained_requests, query, final_callback) {
            if (remained_requests.length > 0) {
                var intmode = SCWeb.ui.SearchPanel.intmode;
                var request = remained_requests[remained_requests.length - 1];
                var url_prefix = request.url_prefix;
                var module_name = request.module_name;
                var url = url_prefix + query;

                if (intmode.cache[url] === undefined) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, true);
                    xhr.setRequestHeader("Authorization", request.token);
                    xhr.onload = function() {
                        results[module_name] = {
                            is_processed : false,
                            url : url,
                            response : JSON.parse(xhr.responseText),
                            module_name : module_name
                        }
                        remained_requests.pop();

                        intmode.make_request(results, remained_requests, query, final_callback);
                    };
                    xhr.onerror = function() {
                        intmode.make_request(results, remained_requests, query, final_callback);
                    };
                    xhr.send();
                } else {
                    results[module_name] = intmode.cache[url];
                    remained_requests.pop();

                    intmode.make_request(results, remained_requests, query, final_callback);
                }
            } else
                final_callback(results);
        },
        
        process_results : function(results, callback, keys) {
            var entities_values = [];

            for (var mn in results) {
                var result = results[mn];

                if (!result.is_processed && result.response.entities !== undefined) {
                    for (var em in result.response.entities) {
                        var entity = result.response.entities[em];

                        entity.forEach(function(instance) {
                            entities_values.push(instance.body);
                        });
                    }
                }
            }

            for (var mn in results) {
                var result = results[mn];

                if (!result.is_processed) {
                    //add cache entry

                    //extract intents
                    var intents = [];
                    if (result.response.intents !== undefined) {
                        result.response.intents.forEach(function(intent) {
                            var i = {
                                intent : intent.name,
                                confidence : intent.confidence
                            };

                            intents.push(i);
                        });
                    }

                    //extract entities
                    var entities = {};
                    if (result.response.entities !== undefined) {
                        for (var entity in result.response.entities) {
                            var entity_obj = [];

                            result.response.entities[entity].forEach(function(instance) {
                                var e = {
                                    value : instance.body,
                                    last_pos : instance.end,
                                    from : instance.from
                                };
    
                                entity_obj.push(e);
                            });

                            entities[entity] = entity_obj;
                        }
                    }

                    result.response = {
                        intents : intents,
                        entities : entities
                    };
                    result.is_processed = true;

                    SCWeb.ui.SearchPanel.intmode.cache[result.url] = result;
                }
            }

            SCWeb.ui.SearchPanel.intmode.select_questions(results, callback, keys);
        },
        
        select_questions : function(results, callback, keys) {
            var intmode = SCWeb.ui.SearchPanel.intmode;
            var final_questions = [];
            var args_mapped_to_questions = {};

            for (var mn in results) {
                var result = results[mn];

                //we've got results for a module
                //check all available (not disabled) questions on this result

                var module = intmode.modules[result.module_name];

                module.questions.forEach(function(question) {
                    if (question.flags.is_enabled && question.lang === intmode.current_lang_idtf) {
                        var args = intmode.check_question(result.response, question);
                        if (args !== false) {
                            final_questions.push(question);
                            args_mapped_to_questions[question.question_idtf] = args;
                        }
                    }
                });
            }

            intmode.add_questions(final_questions, args_mapped_to_questions, callback, keys);
        },

        add_questions : function(questions, results, callback, keys) {
            questions.forEach(function(question) {
                var args = results[question.question_idtf];
                keys.push({
                    group : "intmode",
                    title : question.translate(args),
                    question : question,
                    args : args
                });
            });

            callback();
        },

        check_question : function(result, question) {
            var intmode = SCWeb.ui.SearchPanel.intmode;
            var args = [];

            //check intent
            var matched_intent = false;

            for (var i = 0; i < result.intents.length; ++i) {
                var _intent = result.intents[i];

                if (_intent.intent === question.intent &&
                    _intent.confidence  >= question.minimal_confidence) {

                    matched_intent = true;
                    break;
                }
            }

            if (!matched_intent)
                return false;

            //check entities against arguments pattern
            var args_count_requested = question.arguments.count;
            var descriptors = question.arguments.descriptors;
            var infinite_args = args_count_requested === -1;

            var entities_and_last_pos = {};

            if (infinite_args && descriptors.length !== 1)
                return false;

            var count_of_infinite_args = infinite_args ? result.entities[descriptors[0].entity].length : 0;

            /*
             * Add system which calculates requested count of instances for each entity (let's the count is n), selects
             * n most probable instances from them and uses only them to extract the arguments
             * 
             * Such system would help in the case when the model is underteached and throws several entities where
             * only one should be 
            */

            for (var i = 0; i < (infinite_args ? count_of_infinite_args : descriptors.length); ++i) {
                var descriptor = infinite_args ? descriptors[0] : descriptors[i];
                var last_pos = 0;

                if (entities_and_last_pos[descriptor.entity] !== undefined)
                    last_pos = entities_and_last_pos[descriptor.entity];

                //find entity instance which begins after last_pos, increase last_pos
                if (result.entities[descriptor.entity] !== undefined) {
                    var instance = intmode.
                        find_next_entity_instance(result.entities[descriptor.entity], last_pos);

                    if (instance !== null || infinite_args) {
                        entities_and_last_pos[descriptor.entity] = instance.last_pos;
                        args.push(instance.value);
                    } else
                        return false;
                } else
                    return false;
            }

            return args;
        },

        find_next_entity_instance : function(instances, last_pos) {
            var the_instance = null;

            for (var i = 0; i < instances.length; ++i) {
                var instance = instances[i];

                if (instance.last_pos >= last_pos &&
                     (the_instance === null || instance.from <= the_instance.from))
                    the_instance = instance;
            }

            return instance;
        },

        run_question : function(question) {
            console.log("[IntMode] Running `" + question.question.question_idtf + "` with args=" + question.args.toString());

            var intmode = SCWeb.ui.SearchPanel.intmode;
            var addrs = [];

            intmode.find_args_addrs(question.args, addrs, 0, function() {
                SCWeb.core.Main.doCommand(intmode.questions_addrs[question.question.question_idtf], addrs);
            },
            function(arg) {
                console.warn("[IntMode] No sc-elements were found for idtf `" + arg + "`");
                SCWeb.core.Main.doDefaultCommand([intmode.special_addrs.nothing_found.addr]);
            });
        },
        
        find_args_addrs : function(args, addrs, index, success, failure) {
            if (index < args.length) {
                SCWeb.core.Server.findIdentifiersSubStr(args[index], function (data) {                  
                    var search = function (key) {
                        var list = data[key];
                                
                        if (list) {
                            for (idx in list) {
                                var value = list[idx];
                                        
                                if (value[1] === args[index]) {
                                    addrs.push(value[0]);

                                    break;
                                }
                            }
                        }
                    }
    
                    var length = addrs.length;

                    search('sys');

                    if (length === addrs.length)
                        search('main');

                    if (length === addrs.length)
                        search('common');
                    
                    if (length !== addrs.length)
                        SCWeb.ui.SearchPanel.intmode.find_args_addrs(args, addrs, index + 1, success, failure);
                    else
                        failure(args[index]);
                });
            } else
                success();
        },
    },
};
