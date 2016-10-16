var app = app || {};

app.model = app.model || {};

/**
 * A movie model used for all movies within the application
 * 
 * @alias app.model.movie
 * @constructor
 * @param {String} title
 * @param {String} rtid
 * @param {String} posterframe
 * @param {String} synopsis
 */
app.model.movie = function appModelMovie(title, rtid, posterframe, synopsis) {
	
	/**
	 * The videos instance variables
	 */
	var _title,
		_rtid,
		_posterframe,
		_synopsis,
		_releaseDate,
		_videos = [],
		_actors = [],
		_rating,
		_favourite = false,
		_self = this;

	/**
	 * Getters and setters
	 */

	this.init = function(){
		/**
		 * Set the instance variables using the constructors arguments
		 */
		this.setTitle(title);
		this.setRtid(rtid);
		this.setPosterframe(posterframe);
		this.setSynopsis(synopsis);
	}

	/**
	 * Returns the movie title
	 * @return {String}
	 */
	this.getTitle = function(){
		return _title;
	}
	
	/**
	 * Sets the movie title
	 * @param {String} title
	 */
	this.setTitle = function(title){
		_title = title;
	}
	
	/**
	 * Returns the Rotten Tomatoes reference ID
	 * @return {String}
	 */
	this.getRtid = function(){
		return _rtid;
	}
	
	/**
	 * Sets the Rotten Tomatoes reference ID
	 * @param {String} rtid
	 */
	this.setRtid = function(rtid){
		_rtid = rtid;
	}
	
	/**
	 * Gets the posterframe URL/Path
	 * @return {String}
	 */
	this.getPosterframe = function(){
		return _posterframe;
	}
	
	/**
	 * Sets the posterframe URN/Path
	 * @param {String} posterframe
	 */
	this.setPosterframe = function(posterframe){
		_posterframe = posterframe;
	}
	
	/**
	 * Gets the synopsis as a string with no HTML formatting
	 * @return {String}
	 */
	this.getSynopsis = function(){		
		return _synopsis;
	}
	
	/**
	 * Sets the synopsis, a string with no HTML must be passed
	 * @param {String} synopsis
	 */
	this.setSynopsis = function(synopsis){
		
		if(app.utility.validator.isEmpty(synopsis)){
			_synopsis = null;
		} else {
			_synopsis = synopsis;
		}
		
	}
	
	/**
	 * Gets all videos associated with the movie
	 * @return {Array}
	 */
	this.getVideos = function(){
		return _videos;
	}
	
	/**
	 * Sets all videos associated with the movie
	 * @param {Array}
	 */
	this.setVideos = function(videos){
		
		_videos.length = 0;
		
		/**
		 * Rather than setting the videos all in one go
		 * you use the addVideo method which can handle
		 * any validation for each video before it's
		 * added to the object
		 */
		for(var i = 0; i < videos.length; i++){
			_self.addVideo(videos[i]);
		}
	}
	
	/**
	 * Adds a video to the movie
	 * @param {app.model.video} video
	 */
	this.addVideo = function(video){
		/**
		 * You can add any video validation here
		 * before it's added to the movie
		 */
		_videos.push(video);
	}
	
	/**
	 * Gets all actors associated with the movie
	 * @return {Array}
	 */
	this.getActors = function(){
		return _actors;
	}
	
	/**
	 * Gets an actor at a specific index
	 * @param {Integer} index
	 * @return {app.model.actor}
	 */
	this.getActor = function(index){
		return _actors[index];
	}
	
	/**
	 * Sets all actors associated with the movie
	 * @param {Array}
	 */
	this.setActors = function(actors){
		
		_actors.length = 0;
		
		/**
		 * Rather than setting the actors all in one go
		 * you use the addActor method which can handle
		 * any validation for each actor before it's
		 * added to the object
		 */
		for(var i = 0; i < actors.length; i++){
			_self.addActor(actors[i]);
		}
	}
	
	/**
	 * Adds an actor to the movie
	 * @param {app.model.actor} actor
	 */
	this.addActor = function(actor){
		/**
		 * You can add any actor validation here
		 * before it's added to the movie
		 */
		_actors.push(actor);
	}
	
	/**
	 * Sets the release date
	 */
	this.setReleaseDate = function(releaseDate){
		_releaseDate = releaseDate;
	}
	
	/**
	 * Gets the release date
	 * @return {app.type.releaseDate}
	 */
	this.getReleaseDate = function(){
		return _releaseDate;
	}
	
	/**
	 * Gets the movies rating
	 * @return {String}
	 */
	this.getRating = function(){
		return _rating;
	}
	
	/**
	 * Sets the movie rating
	 * @param {String} rating
	 */
	this.setRating = function(rating){
		_rating = rating;
	}
	
	/**
	 * Checks to see whether the movie
	 * is in the users favourites list
	 * @return {Bool}
	 */
	this.isFavourite = function(){
		return _favourite;
	}
	
	/**
	 * Sets whether the movie is in the
	 * users favourites list
	 * @param {Bool} value
	 */
	this.setFavourite = function(value){
		if(value === true){
			_favourite = true;
		} else {
			_favourite = false;
		}
	}
	
	this.init();
	
}
