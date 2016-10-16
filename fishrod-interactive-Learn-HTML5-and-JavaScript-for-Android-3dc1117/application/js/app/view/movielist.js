var app = app || {};

app.view = app.view || {};

/**
 * Creates a new view based on the search results
 * @param {Array} results
 */
app.view.movielist = function(results){
	
	var _results = results,
		_rootElement;
	
	// Create the root UL element
	_rootElement = document.createElement('ul');
	_rootElement.classList.add('list');
	_rootElement.classList.add('movie-list');
	
	for(var i = 0; i < results.length; i++){
		var itemView = new app.view.movielistitem(results[i]);
		_rootElement.appendChild(itemView.render());
	}
	
	this.render = function(){
		return _rootElement;
	}
	
}
