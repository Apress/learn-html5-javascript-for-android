var app = app || {};

app.controller = app.controller || {};

app.controller.favourites = function(){
	
	var _listScroll = null;
	
	this.init = function(){
		
	}
	
	this.add = function(data){
		
		// Get the movie data
		var _movie = data;
		// Load the favourites from localStorage
		var _favourites = JSON.parse(localStorage.favourites);
		
		/**
		 * Check to see whether the movie
		 * is already in the users favourites
		 */
		for(var i = 0; i < _favourites.length; i++){
			if(_favourites[i].id == _movie.id){
				return;
			}
		}
		
		/**
		 * Change the buttons attributes
		 */
		if(this.nodeName == 'A'){
			this.setAttribute('data-action', 'remove');
			this.classList.remove('add');
			this.classList.add('remove');
			this.textContent = 'un-favourite';
		}
		
		// Pish the movie to the favourites array
		_favourites.push(_movie);
		
		// Save it back to localStorage
		localStorage.favourites = JSON.stringify(_favourites);
		
	}
	
	this.list = function(){
		
		// Get the favourites from local storage
		var _favourites = JSON.parse(localStorage.favourites),
			// Create an empty movies variable
			_movies = [],
			// Get the favouritesList card from the DOM
			_favouriteslist = document.getElementById('card-favourite_list');
		
		/**
		 * Loop through each of the favourites backwards
		 * this will ensure that the most recent favourite
		 * is displayed at the top of the list
		 */
		for(var i = _favourites.length; i > 0; i--){
			var _favourite = _favourites[i - 1];
			// Push the movie model to the movies array
			_movies.push(new app.model.movie(unescape(_favourite.title), _favourite.id, _favourite.posterframe, unescape(_favourite.synopsis)))
		}
		
		/**
		 * Create a new movielist view with the _movies model
		 */
		var view = new app.view.movielist(_movies);
				
		// Set the contents of the search results div
		_favouriteslist.innerHTML = '';
		// Apend the view to the favourites list
		_favouriteslist.appendChild(view.render());

		// Destroy the listScroll if it exists
		if(_listScroll !== null){
			_listScroll.destroy();
			_listScroll = null;
		}
		
		// Create a new one
		_listScroll = new iScroll(_favouriteslist);

		// Hide all of the cards
		app.utility.deck.hideAllCards();
		// Show only the favourites card
		app.utility.deck.showCard('card-favourite_list');
		
	}
	
	this.remove = function(data){
		// Get the ID of the favourite to remove
		var _id = data.id;
		// Get the users favourites from localStorage
		var _favourites = JSON.parse(localStorage.favourites);
		
		// Loop through the favourites
		for(var i = 0; i < _favourites.length; i++){
			// If there's a match
			if(_favourites[i].id == _id){
				// Remove the item from the favourites using splice
				_favourites.splice(i, 1);
			}
		}
		
		// Save the changed favourites object back to localStorage
		localStorage.favourites = JSON.stringify(_favourites);
		
		/**
		 * Change the add/remove favourits button
		 * so that it will either add/remote the item
		 * from the favourites
		 */
		if(this.nodeName == 'A'){
			this.setAttribute('data-action', 'add');
			this.classList.remove('remove');
			this.classList.add('add');
			this.textContent = 'favourite';
		}
		
	}
	
	
	this.init();
	
}
