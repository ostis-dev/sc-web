/**
 * Error codes
 * @type {Object}
 */
SCWeb.core.ErrorCode = {
	Unknown: 0,
	ItemNotFound: 1,
	ItemAlreadyExists: 2
};

/**
 * @Class
 */
SCWeb.core.Debug = {

	/**
	 * Code map
	 * @type {Object}
	 * @private
	 */
	_code_map: {
		0: "Unknown",
		1: "ItemNotFound",
		2: "ItemAlreadyExists"
	},

	/**
	 * Get error text by code
	 * @private
	 * @param {SCWeb.core.ErrorCode} code Error code
	 */
	_codeToText: function(code) {
		return this._code_map[code];
	},
	
	/**
	 * Function to call, when any error occurs
	 * @param {SCWeb.core.ErrorCode} code Code of error (error type)
	 * @param {String} message Error message
	 */
	error: function(code, message) {
		console.log("Error: " + this._codeToText(code) + ". " + message);
	}
};
