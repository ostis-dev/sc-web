/* Params: 
 * @param {Integer} _addr sc-addr of element
 * @param {Integer} _type type of sc-element
 * @param {ScElement} _src source element for edge
 * @param {ScElement} _trg target element for edge
 */
ScElement = function(_addr, _type, _src, _trg) {
    this.addr = _addr;
    this.type = _type;
    this.source = _src;
    this.target = _trg;
    this.struct = null;
};

ScElement.prototype.isNode = function() {
    return (this.type & sc_type_node);        
};
        
ScElement.prototype.isLink = function() {
    return (this.type & sc_type_link);        
};
        
ScElement.prototype.isEdge = function() {
    return (this.type & sc_type_arc_mask);
};
        
ScElement.prototype.isConst = function() {
    return (this.type & sc_type_const);
};
        
ScElement.prototype.isVar = function() {
    return (this.type & sc_type_var);
};
        
ScElement.prototype.getAddr = function() {
    return this.addr;
};
        
ScElement.prototype.getType = function() {
    return this.type;
};
        
ScElement.prototype.getSource = function() {
    return this.source;
};
        
ScElement.prototype.getTarget = function() {
    return this.target;
};


ScStruct = function(struct_addr, _name) {
    var addr = struct_addr;
    var name = _name;
    
    // TODO: optimize store structure
    // Use simple structure to store graph (not optimized)
    var elements = [];
    
    // Edges in this array must be ordered, so you can safely create them in that order.
    // It guarantee: if edgeX need for construction of edgeY, then edgeY will ba placed in this array before edgeX.
    var edges = [];
    
    // ----------------------
    function _checkScType(_type) {
        if (!isValidScType(_type))
            throw "Invalid type: " + _type;
    }
    
    function _checkScAddr(_addr) {
        if (!isValidScAddr(_addr))
            throw "Invalid addr: " + _addr;
    }
    
    function _compareIterType(_iterType, _elType) {
        return ((_iterType & _elType) == _iterType);
    }
    
    // ----------------------
    function _hasElement(el) {
        return (elements.indexOf(el) != -1);
    }
    
    // ----------------------
    function _addElement(el) {
        if (el.struct)
            throw "Element " + el.getAddr() + " already assigned to structure " + el.struct.getName();
                
        if (_hasElement(el))
            throw "Element " + el.getAddr() + " already exist in structure " + name;
        
        el.struct = this;
        elements.push(el);
        if (el.isEdge())
            edges.push(el);
    }
    
    // ----------------------
    function _findElement(_addr) {
        _checkScAddr(_addr);
        
        for (var e in elements) {
            var el = elements[e];
            
            if (el.getAddr() == _addr) {
                return el;
            }
        }
        return null;
    }
    
    // ----------------------
    /* Iterate all elements by specified type mask 
     * @param {number} _type type mask to iterate
     * @param {function} eachFunc function that will be called on each iterated element. 
     * Whereelement will be a parameter of this function.
     */
    function _iterate_elements(_type, eachFunc) {
        for (var e in elements) {
            var el = elements[e];
            
            if ((el.getType() & _type) != 0) {
                eachFunc(el);
            }
        }
    }
    
    // ----------------------
    /* Iterate constructions with f_a_f template
     */
    function _iterate3_f_a_f(_addr1, _type2, _addr3, eachFunc) {
        var param1 = _addr1,
            param2 = _type2,
            param3 = _addr3;
        
        if (_addr1 instanceof ScElement)
            param1 = _addr1.getAddr();
        if (_addr3 instanceof ScElement)
            param3 = _addr3.getAddr();
        
        _checkScAddr(param1);
        _checkScType(param2);
        _checkScAddr(param3);
            
        for (var e in edges) {
            var edge = edges[e];
            var edgeType = scTypeVar2Const(edge.getType());
            
            if (!_compareIterType(param2, edgeType)) 
                continue;
            
            var src = edge.getSource();
            if (src.getAddr() != param1)
                continue;
            
            var trg = edge.getTarget();
            if (trg.getAddr() != param3)
                continue;
                
            eachFunc(src, edge, trg);
        }
    }
    
    /* Iterate constructions with f_a_f template
     */
    function _iterate3_f_a_a(_addr1, _type2, _type3, eachFunc) {
        var param1 = _addr1,
            param2 = _type2,
            param3 = _type3;
        
        if (_addr1 instanceof ScElement)
            param1 = _addr1.getAddr();
        
        _checkScAddr(param1);
        _checkScType(param2);
        _checkScType(param3);
            
        for (var e in edges) {
            var edge = edges[e];
            var edgeType = scTypeVar2Const(edge.getType());
            
            if (!_compareIterType(param2, edgeType)) 
                continue;
            
            var src = edge.getSource();
            if (src.getAddr() != param1)
                continue;
            
            var trg = edge.getTarget();
            if (!_compareIterType(param3, scTypeVar2Const(trg.getType())))
                continue;
                
            eachFunc(src, edge, trg);
        }
    }
    
    /* Iterate constructions with f_a_f template
     */
    function _iterate3_a_a_f(_type1, _type2, _addr3, eachFunc) {
        var param1 = _type1,
            param2 = _type2,
            param3 = _addr3;
        
        if (_addr3 instanceof ScElement)
            param3 = _addr3.getAddr();
        
        _checkScType(param1);
        _checkScType(param2);
        _checkScAddr(param3);
        
        for (var e in edges) {
            var edge = edges[e];
            var edgeType = scTypeVar2Const(edge.getType());
            
            if (!_compareIterType(param2, edgeType)) 
                continue;
            
            var src = edge.getSource();
            if (!_compareIterType(param1, scTypeVar2Const(src.getType())))
                continue;
            
            var trg = edge.getTarget();
            if (trg.getAddr() != param3)
                continue;
                
            eachFunc(src, edge, trg);
        }
    }
    
    
    
    // ----------------------
    
    return {
        hasElement: _hasElement,
        addElement: _addElement,
        
        iterate_3_f_a_f: _iterate3_f_a_f,
        iterate_3_f_a_a: _iterate3_f_a_a,
        iterate_3_a_a_f: _iterate3_a_a_f,
        
        iterate_elements: _iterate_elements,
        
        findElement: _findElement,
        
        getName: function() { return name; }
    }
};

/* Build template to for search in ScStruct
 * @param {ScStruct} _struct ScStruct to use as template
 * @note For this moment it doesn't support iteration of elements that has no any out(in) edge in template
 */ 
ScTemplate = function(_struct) {
    
    var templEdges = [];
    var templStruct = _struct;
    var result = {};
    
    _struct.iterate_elements(sc_type_arc_mask, function (el) {
        templEdges.push(el);
    });
        
    function _iterate_iter(struct, edgeIndex, eachFunc) {
        
        function iter_result(foundSrc, foundEdge, foundTrg) {
            result[src] = foundSrc;
            result[trg] = foundTrg;
            result[edge] = foundEdge;

            _iterate_iter(struct, edgeIndex + 1, eachFunc);
        }

        if ((edgeIndex != 0) && (edgeIndex == templEdges.length)) {
            eachFunc(result);
            return;
        }

        // do iteration
        if (edgeIndex < templEdges.length) {
            
            var edge = templEdges[edgeIndex];
            var src = edge.getSource();
            var trg = edge.getTarget();
            
            if (!edge.isVar())
                throw "Edge in template must be a variable";
            
            var edgeType = scTypeVar2Const(edge.getType());
            // f_a_f
            if (src.isConst() && trg.isConst()) {
                struct.iterate_3_f_a_f(src, edgeType, trg, iter_result);
            } else if (src.isConst()) {
                var resolvedTarget = result[trg];
                
                if (resolvedTarget) { // f_a_f
                    struct.iterate_3_f_a_f(src, edgeType, resolvedTarget, iter_result);
                } else { // f_a_a
                    struct.iterate_3_f_a_a(src, edgeType, scTypeVar2Const(trg.getType()), iter_result);
                }
            } else if (trg.isConst()) {
                var resolvedSrc = result[src];

                if (resolvedSrc) { // f_a_f
                    struct.iterate_3_f_a_f(resolvedSrc, edgeType, trg, iter_result);
                } else { // a_a_f
                    struct.iterate_3_a_a_f(scTypeVar2Const(src.getType()), edgeType, trg, iter_result);
                }
            } else {
                throw "Invalid template";
            }
        }
    }
    
    /* Iterate constructions by this template in struct
     * @param {ScStruct} struct Struct where iterate construction by this template
     * @param {function} eachFunc Function that calls on each result. It receive on parameter - map,
     * where key is an ScElement from template; value - founded ScElement that designate element from template
     */
    function _iterate(struct, eachFunc) {
        /// TODO: support elements withut out(in) edge
        _iterate_iter(struct, 0, eachFunc);
    }
    
    return {
        iterate: _iterate
    }
};
