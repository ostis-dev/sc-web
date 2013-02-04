SCWeb.core.Translation = {
    
    current_language: null,
    listeners: [],
	
	_cache	: null,
    
    /** 
     * @param {Object} listener Listener object that will be notified on translation.
     * It must has two functions:
     * - getObjectsToTranslate() - funciton returns array of sc-addrs, that need to be 
     * translated
     * - updateTranslation(identifiers) - fucntion, that calls when translation finished,
     * and notify, that view must be updated
     */
    registerListener: function(listener) {
        if (this.listeners.indexOf(listener) == -1) {
            this.listeners.push(listener);
        }
    },
    
    /**
     * @param {Object} listener Listener objects that need to be unregistered
     */
    unregisterListener: function(listener) {
        var idx = this.listeners.indexOf(listener);
        if (idx >= 0) {
            this.listeners.splice(idx, 1);
        }
    },
    
    /**
     * @param {String} sc-addr of new identifiers language 
     */
    languageChanged: function(language) {
        this.current_language = language;
         
        // collect objects, that need to be translated
        var objects = [];
        for (var i = 0; i < this.listeners.length; i++) {
            objects = objects.concat(this.listeners[i].getObjectsToTranslate());
        }
        
        // @todo need to remove duplicates from object list
        // translate
        var self = this;
        this.translate(objects, language, function(namesMap) {
            // notify listeners for new translations
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].updateTranslation(namesMap);
            }
        });
        
     },
      
    /**
     * @param {Array} objects List of sc-addrs, that need to be translated
     * @param {String} language It it value is null, then current language used
     * @return Return object, that contains [key, value], where 
     * key is sc-addr of element and value is identifier.
     * If there are no key in returned object, then identifier wasn't found
     */
    translate: function(objects, language, callback) {
        var lang = language;
        
        if (!language)
            lang = this.current_language;
        		
		var cache = this.getCache();
		var needToTranslate = [];
		var translated = [];
		for(var i = 0; i < objects.length; i++){
			var translation = cache.getTranslation(lang, objects[i]);
			if(translation){
				translated.push(objects[i]);
			} else {
				needToTranslate.push(objects[i]);
			}
			
		}
		
		if(needToTranslate.length > 0){
			SCWeb.core.Server.resolveIdentifiers(needToTranslate, lang, function(namesMap) {
				cache.addTranslations(lang, namesMap);
				callback(cache.getTranslations(lang, objects));
			});
		} else {
			callback(cache.getTranslations(lang, objects));
		}
		
    },

	getCache	: function(){
		if(!this._cache){
			this._cache = new SCWeb.core.Translation.Cache();
		};
		return this._cache;
	}

};

/**
 * Translation cache
 * @constructor
 */
SCWeb.core.Translation.Cache = function(){
	this._init();
};

SCWeb.core.Translation.Cache.prototype = {

	_init	: function(){
		this._languages = {};
	},

    /**
     *
     * @param {String} language
     * @param {Array} objects Objects for translating
     * @return {Object}
     */
	getTranslations	: function(language, objects){
		var map = {};
		for(var i = 0; i < objects.length; i++ ){
			map[objects[i]] = this.getTranslation(language, objects[i]);
		}
		return map;	
	},

    /**
     *
     * @param {String} language
     * @param {String} obj Object for translating
     * @return {*}
     */
	getTranslation	: function(language, obj){
		
		var lang = this._getLanguage(language);
		if(lang){
			return lang[obj];
		}
		return null;
	},

    /**
     * Add translations to cache
     * @param {String} language
     * @param {Object} map
     */
	addTranslations	: function(language, map){
		for(var scAddr in map){
			this.setTranslation(language, scAddr, map[scAddr]);
		}
	},

    /**
     * Add translation to cache
     * @param {String} language
     * @param {String} obj
     * @param {String} value
     */
	setTranslation	: function(language, obj, value){
		var lang = this._getLanguage(language, true);
		lang[obj] = value;
	},

    /**
     * Get language translation map
     * @param {String} language
     * @param {Bool} createIfNotExist
     * @return {Object} map of language translations
     * @private
     */
	_getLanguage	: function(language, createIfNotExist){
		if(!this._languages[language] && createIfNotExist){
			this._languages[language] = {};
		}
		return this._languages[language];
	}

}
