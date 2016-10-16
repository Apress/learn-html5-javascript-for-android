var app = app || {};

app.type = app.type || {};

/**
 * The media type, can be used to
 * define mime types of objects
 * @param {String} name
 * @param {String} format
 * @param {String} mime
 */

app.type.format = function(name, format, mime){
		
	/**
	 * The media's instance variables
	 */
	var _name,
		_format,
		_mime,
		_self = this;
	
	this.init = function(){
		/**
		 * Set the instance variables using the constructors arguments
		 */
		this.setName(name);
		this.setFormat(format);
		this.setMime(mime);
	}
	
	/**
	 * Getters and setters
	 */

	/**
	 * Gets the name of the media type
	 * @return {String}
	 */
	this.getName = function(){
		return _name;
	}
	
	/**
	 * Sets the name of the media type
	 * @param {String} name
	 */
	this.setName = function(name){
		_name = name;
	}
	
	/**
	 * Gets the format of the media i.e. webm, ogv
	 * @return {String}
	 */
	this.getFormat = function(){
		return _format;
	}
	
	/**
	 * Sets the format of the media
	 * @param {String} format
	 */
	this.setFormat = function(format){
		_format = format;
	}
	
	/**
	 * Gets the mime type of the media
	 * @return {String}
	 */
	this.getMime = function(){
		return _mime;
	}
	
	/**
	 * Sets the mime type of the media
	 * @param {String} mime
	 */
	this.setMime = function(mime){
		_mime = mime;
	}
	
	this.init();
	
}