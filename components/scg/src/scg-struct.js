function ScgFromScImpl(_sandbox, _editor, aMapping) {
    
    var self = this,
        arcMapping = aMapping,
        tasks = [],
        timeout = 0, 
        batch = null,
        tasksLength = 0,
        editor = _editor,
        sandbox = _sandbox;
    
    function resolveIdtf(addr, obj) {
        sandbox.getIdentifier(addr, function(idtf) {
            obj.setText(idtf);
        });
    }

    function randomPos() {
        return new SCg.Vector3(100 * Math.random(), 100 * Math.random(), 0);
    }
    
    var doBatch = function() {
        
        if (!batch) {
            if (!tasks.length || tasksLength === tasks.length) {
                window.clearInterval(self.timeout);
                self.timeout = 0;
                return;
            }
            batch = tasks.splice(0, Math.max(150, tasks.length));
            tasksLength = tasks.length;
        }
        if (batch) {

            taskDoneCount = 0;
            for (var i = 0; i < batch.length; ++i) {
                var task = batch[i];
                var addr = task[0];
                var type = task[1];

                if (editor.scene.getObjectByScAddr(addr))
                    continue;

                if (type & sc_type_node) {
                    var model_node = editor.scene.createNode(type, randomPos(), '');
                    model_node.setScAddr(addr);
                    model_node.setObjectState(SCgObjectState.FromMemory);
                    resolveIdtf(addr, model_node);
                } else if (type & sc_type_arc_mask) {
                    var bObj = editor.scene.getObjectByScAddr(task[2]);
                    var eObj = editor.scene.getObjectByScAddr(task[3]);
                    if (!bObj || !eObj) {
                        tasks.push(task);
                    } else {
                        var model_edge = editor.scene.createEdge(bObj, eObj, type);
                        model_edge.setScAddr(addr);
                        model_edge.setObjectState(SCgObjectState.FromMemory);
                        resolveIdtf(addr, model_edge);
                    }
                } else if (type & sc_type_link) {
                    var containerId = 'scg-window-' + sandbox.addr + '-' + addr + '-' + new Date().getUTCMilliseconds();;
                    var model_link = editor.scene.createLink(randomPos(), containerId);
                    model_link.setScAddr(addr);
                    model_link.setObjectState(SCgObjectState.FromMemory);
                }
                
            }

            editor.render.update();
            editor.scene.layout();
            
            batch = null;
        }
    };
    
    var addTask = function(args) {
        tasks.push(args);
        if (!self.timeout) {
            self.timeout = window.setInterval(doBatch, 10);
        }
        doBatch();
    };
    
    var removeElement = function(addr) {
        var obj = editor.scene.getObjectByScAddr(addr);
        if (obj)
            editor.scene.deleteObjects([obj]);
        editor.render.update();
        editor.scene.layout();
    };
    
    return {
        update: function(added, element, arc) {
            
            if (added) {
                window.sctpClient.get_arc(arc).done(function (r) {
                    var el = r[1];
                    window.sctpClient.get_element_type(el).done(function(t) {
                        arcMapping[arc] = el;
                        if (t & (sc_type_node | sc_type_link)) {
                            addTask([el, t]);
                        } else if (t & sc_type_arc_mask) {
                            window.sctpClient.get_arc(el).done(function(r) {
                                addTask([el, t, r[0], r[1]]);
                            });
                        } else
                            throw "Unknown element type " + t;
                    });
                });
            } else {
                var e = arcMapping[arc];
                if (e)
                    removeElement(e);
            }
        }
    };
    
};

// ----------------------------------------------------------------------

//! TODO: refactoring
function scgScStructTranslator(_editor, _sandbox) {
    var r, editor = _editor,
        sandbox = _sandbox,
        tasks = [],
        processBatch = false,
        taskDoneCount = 0,
        arcMapping = {};
    
    if (!sandbox.is_struct)
        throw "Snadbox must to work with sc-struct";
    
    var scgFromSc = new ScgFromScImpl(sandbox, editor, arcMapping);
    
    var appendToConstruction = function(obj) {
        var dfd = new jQuery.Deferred();
        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, sandbox.addr, obj.sc_addr).done(function(addr) {
            arcMapping[addr] = obj;
            dfd.resolve();
        }).fail(function() {
            dfd.reject();
        });
        return dfd.promise();
    };
    

    
    return r = {
        mergedWithMemory: function(obj) {
            if (!obj.sc_addr)
                throw "Invalid parameter";
            
            window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                                               [sandbox.addr, sc_type_arc_pos_const_perm, obj.sc_addr]).done(function(r) {
                if (r.length == 0) {
                    appendToConstruction(obj);
                }
            });
        },
        updateFromSc: function(added, element, arc) {
            scgFromSc.update(added, element, arc);
        },
        
        translateToSc: function(callback) {
            if (!sandbox.is_struct)
                throw "Invalid state. Trying translate sc-link into sc-memory";

            var dfdNodes = jQuery.Deferred();

            // translate nodes
            var nodes = editor.scene.nodes.slice();
            var links = editor.scene.links.slice();
            var objects = [];
            
            
            var appendObjects = function() {
                $.when.apply($, objects.map(function(obj) {
                    return appendToConstruction(obj);
                })).done(function() {
                    callback(true);
                }).fail(function() {
                    callback(false);
                });
            };
            
            function fireCallback() {
                editor.render.update();
                editor.scene.layout();
                appendObjects();
            }

            
            /// --------------------
            var translateNodes = function() {
                var dfdNodes = new jQuery.Deferred();
                
                var implFunc = function(node) {
                    var dfd = new jQuery.Deferred();

                    if (!node.sc_addr) {
                        window.sctpClient.create_node(node.sc_type).done(function (r) {
                            node.setScAddr(r);
                            node.setObjectState(SCgObjectState.NewInMemory);

                            objects.push(node);
                            dfd.resolve();
                        });
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
                }
                
                var funcs = [];
                for (var i = 0; i < nodes.length; ++i) {
                    funcs.push(fQueue.Func(implFunc, [ nodes[i] ]));
                }
                
                fQueue.Queue.apply(this, funcs).done(dfdNodes.resolve).fail(dfdNodes.reject);
                
                return dfdNodes.promise();
            }
            
            var preTranslateContours = function() {
                var dfd = new jQuery.Deferred();
                
                // create sc-struct nodes
                var scAddrGen = function(c) {
                    var dfd = new jQuery.Deferred();
                    
                    if (c.sc_addr)
                        dfd.resolve();
                    else {
                        window.sctpClient.create_node(sc_type_const | sc_type_node | sc_type_node_struct).done(function (node) {
                            c.setScAddr(node);
                            c.setObjectState(SCgObjectState.NewInMemory);
                            dfd.resolve();
                        }).fail(dfd.reject);
                    }

                    return dfd.promise();
                };
                var funcs = [];
                for (var i = 0; i < editor.scene.contours.length; ++i)
                    funcs.push(fQueue.Func(scAddrGen, [ editor.scene.contours[i] ]));
                
                // run tasks
                fQueue.Queue.apply(this, funcs).done(dfd.resolve).fail(dfd.reject);
                
                return dfd.promise();
            }
            
            /// --------------------
            var translateEdges = function() {
                var dfd = new jQuery.Deferred();
                
                // translate edges
                var edges = [];
                editor.scene.edges.map(function(e) {
                    if (!e.sc_addr)
                        edges.push(e);
                });

                var edgesNew = [];
                var translatedCount = 0;
                function doIteration() {
                    var edge = edges.shift();
                    
                    function nextIteration() {
                        if (edges.length === 0) {
                            if (translatedCount === 0 || (edges.length === 0 && edgesNew.length === 0))
                                dfd.resolve();
                            else {
                                edges = edgesNew;
                                edgesNew = [];
                                translatedCount = 0;
                                window.setTimeout(doIteration, 0);
                            }
                        }
                        else
                            window.setTimeout(doIteration, 0);
                    };
                    
                    if (edge.sc_addr) 
                        throw "Edge already have sc-addr";
                    
                    var src = edge.source.sc_addr;
                    var trg = edge.target.sc_addr;

                    if (src && trg) {
                        window.sctpClient.create_arc(edge.sc_type, src, trg).done(function(r) {
                            edge.setScAddr(r);
                            edge.setObjectState(SCgObjectState.NewInMemory);

                            objects.push(edge);
                            translatedCount++;
                            nextIteration();
                        }).fail(function() {
                            console.log('Error while create arc');
                        });
                    } else {
                        edgesNew.push(edge);
                        nextIteration();
                    }
                    
                }
                if (edges.length > 0)
                    window.setTimeout(doIteration, 0);
                else
                    dfd.resolve();
                
                return dfd.promise();
            }
            
            var translateContours = function() {
                var dfdCountours = new jQuery.Deferred();
               
                // now need to process arcs from countours to child elements
                var arcGen = function(contour, child) {
                    var dfd = new jQuery.Deferred();

                    window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F,
                                                       [contour.sc_addr, sc_type_arc_pos_const_perm, child.sc_addr])
                    .done(dfd.resolve)
                    .fail(function() {
                        window.sctpClient.create_arc(sc_type_arc_pos_const_perm, contour.sc_addr, child.sc_addr).done(dfd.resolve).fail(dfd.reject);
                    });

                    return dfd.promise();
                };

                var acrFuncs = [];
                for (var i = 0; i < editor.scene.contours.length; ++i) {
                    var c = editor.scene.contours[i];
                    for (var j = 0;  j < c.childs.length; ++j) {
                        acrFuncs.push(fQueue.Func(arcGen, [ c, c.childs[j] ]));
                    }
                }

                fQueue.Queue.apply(this, acrFuncs).done(dfdCountours.resolve).fail(dfdCountours.reject);

                return dfdCountours.promise();
            }            
            
            /// --------------------
            var translateLinks = function() {
                var dfdLinks = new jQuery.Deferred();
                
                var implFunc = function(link) {
                    var dfd = new jQuery.Deferred();

                    if (!link.sc_addr) {
                        window.sctpClient.create_link().done(function (r) {
                            link.setScAddr(r);
                            link.setObjectState(SCgObjectState.NewInMemory);
                            window.sctpClient.set_link_content(r, link.content)
                            objects.push(link);
                            dfd.resolve();
                        });
                    } else {
                        dfd.resolve();
                    }

                    return dfd.promise();
                }
                
                var funcs = [];
                for (var i = 0; i < links.length; ++i) {
                    funcs.push(fQueue.Func(implFunc, [ links[i] ]));
                }
                
                fQueue.Queue.apply(this, funcs).done(dfdLinks.resolve).fail(dfdLinks.reject);
                
                return dfdLinks.promise();
            }
            
            fQueue.Queue(
                /* Translate nodes */
                fQueue.Func(translateNodes),
                fQueue.Func(translateLinks),
                fQueue.Func(preTranslateContours),
                fQueue.Func(translateEdges),
                // translate bus there (before contours)
                fQueue.Func(translateContours)
            ).done(fireCallback);
            
        }
    };
};
