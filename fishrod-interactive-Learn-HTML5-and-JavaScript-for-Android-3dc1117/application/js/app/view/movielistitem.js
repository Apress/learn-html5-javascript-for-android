var app = app || {};
app.view = app.view || {};

/**
 * Creates a new view for a movie list item
 * @param {app.model.movielistitem} movie
 */
app.view.movielistitem = function(movie){
	
	var _movie = movie,
		_rootElement = document.createElement('li');
		_rootElement.innerHTML = [
			'<a data-controller="movies" data-action="find" data-params="{&quot;id&quot;: &quot;', movie.getRtid() ,'&quot;}" class="more" href="movie/view/', movie.getRtid() ,'">',
				'<div class="preview-image">',
					'<img src="', movie.getPosterframe(), '" alt="', movie.getTitle(), '" height="82" />',
				'</div>',
				'<h2>', movie.getTitle(), '</h2>',
				'<p>', movie.getSynopsis(), '</p>',
			'</a>'
		].join('');
		
	this.render = function(){
		return _rootElement;
	}
}
