var app = app || {};

app.type = app.type || {};

/**
 * The a movie release date,
 * The constructor takes the cinema release date and dvd release date
 * @param {Date} cinema
 * @param {Date} dvd
 */
app.type.releaseDate = function(cinema, dvd){
	
	/**
	 * The release date instance variables
	 */
	var _dvd,
		_cinema;
	
	this.init = function(){
		/**
		 * Sets the instance variables using setters
		 */
		this.setDvd(dvd);
		this.setCinema(cinema);
	}
	
	/**
	 * Gets the DVD release date
	 */
	this.getDvd = function(){
		return _dvd;
	}
	
	/**
	 * Sets the DVD release date
	 */
	this.setDvd = function(dvd){
		_dvd = dvd;
	}
	
	/**
	 * Gets the cinema release date
	 */
	this.getCinema = function(){
		return _cinema;
	}
	
	/**
	 * Sets the cinema release date
	 */
	this.setCinema = function(cinema){
		_cinema = cinema;
	}
	
	this.init();
	
}
