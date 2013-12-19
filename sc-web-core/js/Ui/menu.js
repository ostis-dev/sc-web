SCWeb.ui.Menu = {
    _items: null,

    /*!
     * Initialize menu in user interface
     * @param {Object} params Parameters for menu initialization.
     * There are required parameters:
     * - menu_container_id - id of dom element that will contains menu items
     * - menu_commands - object, that represent menu command hierachy (in format returned from server)
     */
    init: function(params, callback) {
        var self = this;
        
        this.menu_container_id = '#' + params.menu_container_id;
        
        // register for translation updates
        SCWeb.core.EventManager.subscribe("translation/get", this, function(objects) {
			var items = self.getObjectsToTranslate();
			for (var i in items) {
				objects.push(items[i]);
			}
		});
		SCWeb.core.EventManager.subscribe("translation/update", this, function(names) {
			self.updateTranslation(names);
		});
        
        this._build(params.menu_commands);
        callback();
    },

    _build: function(menuData) {

        this._items = [];

        var menuHtml = '<ul class="nav navbar-nav">';

        //TODO: change to children, remove intermediate 'childs'
        if(menuData.hasOwnProperty('childs')) {
            var id, subMenu;
            for(i in menuData.childs) {
                subMenu = menuData.childs[i];
                menuHtml += this._parseMenuItem(subMenu);
            }
        }

        menuHtml += '</ul>';

        $(this.menu_container_id).append(menuHtml);

        this._registerMenuHandler();
    },

    _parseMenuItem: function(item) {

        this._items.push(item.id);

        var itemHtml = '';
        if(item.cmd_type == 'cmd_noatom') {
            itemHtml = '<li class="dropdown"><a sc_addr="' + item.id + '" id="' + item.id + '" class="menu_item ' + item.cmd_type + ' dropdown-toggle" data-toggle="dropdown" href="#" ><span clas="text">' + item.id + '</span><b class="caret"></b></a>';
            
        } else {
            itemHtml = '<li><a id="' + item.id + '"sc_addr="' + item.id + '" class="menu_item ' + item.cmd_type + '" >' + item.id + '</a>';
        }

        if(item.hasOwnProperty('childs')) {
            itemHtml += '<ul class="dropdown-menu">';
            var id;
            var subMenu;
            var i;
            for(i = 0; i < item.childs.length; i++) {
                subMenu = item.childs[i];
                itemHtml += this._parseMenuItem(subMenu);
            }
            itemHtml += '</ul>';
        }
        return itemHtml + '</li>';
    },

    _registerMenuHandler: function() {
        
        SCWeb.ui.Utils.bindArgumentsSelector("menu_container", "[sc_addr]");
        
        $('.menu_item').click(function() {
            
            var sc_addr = $(this).attr('sc_addr');
            if ($(this).hasClass('cmd_atom')) {
				SCWeb.core.Main.doCommand(sc_addr, SCWeb.core.Arguments._arguments);
			}
        });
    },
    
    // ---------- Translation listener interface ------------
    updateTranslation: function(namesMap) {
        // apply translation
        $(this.menu_container_id + ' [sc_addr]').each(function(index, element) {
            var addr = $(element).attr('sc_addr');
            if(namesMap[addr]) {
                $(element).text(namesMap[addr]);
            }
        });
        
    },
    
    /**
     * @return Returns list obj sc-elements that need to be translated
     */
    getObjectsToTranslate: function() {
        return this._items;
    }
};
SCWeb.ui.Clarification = {
	    tooltipElem : null,
	    init : function(objects)
	    {   
	         var self = this;
	         var items = {};
	         var data = '', id, index;
	         var idx = 1;
	         var used = {};
	         for(var i = 1; i <= objects.length; i++) {
				id = objects[i - 1];
				
				if (used[id]) continue; // skip objects, that was processed
				used[id] = true;
	            
	            index = idx + '_';
	            if (i != 1) data += '&';
	            data = index + '=' + id;
	                 self._createClarification(id);     
	      }

	    },
	    fireUpdate: function(namesMap) {
			// notify listeners for new translations
			SCWeb.core.EventManager.emit("translation/update", namesMap);
	    },
	_createClarification: function(id)
			{
	                    var self = this;
	                    var sc_addr = id;
	                    var isEnabled = true;
	                    var offsetFromElement =  10 ;
	                    $('[sc_addr="'+sc_addr+'"]').hover(function(e){

	                  var elem;
		     	  var html;    
	                  var items = {};
	                  SCWeb.core.Server.resolveClarifications('1_='+sc_addr,function(result){  
	                    items = result;
	                    for(var it in result){
	                       self.show({
	                            elem : $('[sc_addr="'+it+'"]'),
	                            html : html = items[it]+""
	                       });
	                    }
	                }); 
		     		
	                    }
	            ,function(e){ 
					
	            	$('[class = "tooltip"]').remove();
			         
				});
				
			},
	                show: function(options)
	                {
	                    var self = this;
	                    var isEnabled = true;
	                    var offsetFromElement =  10 ;
	                          var elem = options.elem;
		         	  var html = options.html; 
	                          var elemCoords = elem.offset();
		     	    var winLeft = $(window).scrollLeft();
	        	    var winTop = $(window).scrollTop();
	      	        self.tooltipElem = $('<div/>', {
	      	        "class" : 'tooltip',
	      	        html: html
	      	      });
	                  
		        	
		        	    self.tooltipElem.appendTo('body'); 
		        	 
		        	    var left = elemCoords.left + (elem.outerWidth() - self.tooltipElem.outerWidth())/2^0;
		        	    if (left < winLeft) left = winLeft; 
		        	    var top = elemCoords.top - self.tooltipElem.outerHeight() - offsetFromElement;
		        	    if (top < winTop) {
		        	      top = elemCoords.top + elem.outerHeight() + offsetFromElement;
		        	    self.tooltipElem.show();
		        	    }
		        	    self.tooltipElem.css({
		        	        left: left,
		        	        top: top
		        	    });
	                }
	};

