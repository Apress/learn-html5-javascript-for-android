var app = app || {};

app.controller = app.controller || {};

app.controller.movies = function(){
	
	var _self = this,
		_searchfield = document.querySelector('#add-movie input[name="query"]'),
		_searchform = document.getElementById('add-movie'),
		_searchresultscard = document.getElementById('card-movie_search_results'),
		_searchTimeout,
		_viewScrolls = [],
		_searchScroll = null,
		_apiKey = 'YOUR_ROTTEN_TOMATOES_API_KEY';
	
	this.init = function(){
		// Any initialization should go here
		this.bindSearchForm();
	}
	
	/**
	 * Binds the search form
	 */
	this.bindSearchForm = function(){
		
		/**
		 * Here you add an event listener to the search filed using
		 * the focus event listener, if there's a value, then show the
		 * results.
		 */
		_searchfield.addEventListener('focus', function(){
			if(this.value.length > 0){
				app.utility.deck.showCard('card-movie_search_results');
			}
		});
		
		/**
		 * Add an event listener to the submission of the form
		 * this will prevent the form from being submitted
		 * and sent to another page, instead we capture the
		 * event and trigger the search action
		 */
		_searchform.addEventListener('submit', function(e){
			
			e.preventDefault();
			
			clearTimeout(_searchTimeout);
			
			var value = _searchfield.value;
			
			if(value.length > 0){			
				_self.search(value);
			}
			
		});
	
		_searchfield.addEventListener('input', function(){
			
			/**
			 * This is the value of the input field
			 */
			var value = this.value;
			
			/**
			 * This will clear the search timeout
			 */
			clearTimeout(_searchTimeout);
			
			/**
			 * You don't want to run search straight after every key press
			 * this will set a timeout of 1 second (1000 ms) before the
			 * search function is called
			 */
			
			if(value.length > 0){
				document.getElementById('taskbar').classList.add('searchactive');
			} else {
				document.getElementById('taskbar').classList.remove('searchactive');
			}
			
			_searchTimeout = setTimeout(function(){
				_self.search(value);
			}, 1000); 
		});
		
	}
	
	this.clearSearch = function(){
		clearTimeout(_searchTimeout);
		_searchfield.value = '';
		app.utility.deck.hideCard('card-movie_search_results');
		
		evt = document.createEvent('HTMLEvents');
		evt.initEvent('input', true, false);
		_searchfield.dispatchEvent(evt);
	}
	
	this.find = function(data){

		if(typeof data.id === 'undefined'){
			throw "No ID supplied to find action in view controller";
			return;
		}
		
		var jsonp = new app.utility.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies/' + data.id + '.json?apikey=' + _apiKey + '', 'app.bootstrap.getController("movies").view');
		jsonp.send();
	}
	
	this.view = function(rtresult){
		
		if(!app.utility.validator.isTypeOf(rtresult, "object")){
			return;
		}
		
		var movie = new app.model.movie(rtresult.title, rtresult.id, rtresult.posters.original, rtresult.synopsis),
			viewcard = document.getElementById('card-movie_info');
		
		/**
		 * Set the DVD and cinema release dates
		 */
		var releaseDate = new app.type.releaseDate(new Date(rtresult.release_dates.theater), new Date(rtresult.release_dates.dvd));
		movie.setReleaseDate(releaseDate);
		
		/**
		 * Set the movies rating
		 */
		movie.setRating(rtresult.mpaa_rating);
		
		/**
		 * Check to see whether the movie is in the users favourites
		 */
		var _favourites = JSON.parse(localStorage.favourites);
		
		for(var i = 0; i < _favourites.length; i++){
			if(_favourites[i].id == movie.getRtid()){
				movie.setFavourite(true);
			}
		}
		
		/**
		 * Add actors to the movie
		 */
		for(var i = 0; i < rtresult.abridged_cast.length; i++){
			var cast = rtresult.abridged_cast[i],
				character = (typeof cast.characters === 'undefined') ? '' : cast.characters[0];
			var actor = new app.model.actor(cast.name, character);
			movie.addActor(actor);
		}
		
		var view = new app.view.movie(movie);
		viewcard.innerHTML = view.render().innerHTML;
				
		_viewScrolls.push(new iScroll(viewcard.querySelector('.movie-content'), {vScroll: false, vScrollbar: false}));
		
		[].forEach.call(viewcard.getElementsByClassName('content'), function(el){
			
			_viewScrolls.push(new iScroll(el, {hScroll: false, hScrollbar: false}));
			
		});
		
		window.addEventListener('resize', function(){
			setTimeout(function(){
				
				_searchScroll.refresh();
				
				for(var i = 0; i < _scrolls.length; i++){
					_viewScrolls[i].refresh();	
				}
				
			}, 100);
		});
		
		app.utility.deck.hideAllCards();
		app.utility.deck.showCard('card-movie_info');
		
	}
	
	this.search = function(query){
	
		// Check to see whether the query length is longer than 0 characters
		if(query.length > 0){
			/*
			 * Encode the query so that it can be passed
			 * through the URL
			 */ 
			query = encodeURIComponent(query);
			/**
			 * Create a new JSONP request
			 */
			var jsonp = new app.utility.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=57t3sa6sp5zz5394btptp9ew&q=' + query, 'app.bootstrap.getController("movies").showSearchResults');
			/**
			 * Send the request
			 */
			jsonp.send();
			/**
			 * Add the loading class to the search field
			 */
			_searchfield.classList.add('loading');
		}

	}
	
	/**
	 * Shows the search results in the search results card
	 */
	this.showSearchResults = function(rtresults){
		
		/**
		 * This is the rotten tomatoes API data.
		 * The code below will process the data
		 * returned and convert them to models
		 * that the application will understand
		 * you could wrap these API calls into
		 * a separate library, but for now having
		 * them in the controller will suffice
		 */
		
		// First create an empty array to hold the results
		var results = [];
		
		// Next loop through the results from rotten tomatoes
		for(var i = 0; i < rtresults.movies.length; i++){
			var rtmovie = rtresults.movies[i];
			// For every result you create a new movie object
			var title = rtmovie.title || '', rtid = rtmovie.id, posterframe = rtmovie.posters.original || '', synopsis = rtmovie.synopsis || '';
			results.push(new app.model.movie(title, rtid, posterframe, synopsis));
		}
		
		// Create the view using the data
		var view = new app.view.movielist(results);
		
		// Set the contents of the search results div
		_searchresultscard.innerHTML = '';
		_searchresultscard.appendChild(view.render());
		_searchresultscard.classList.add('active'); // Controlling pages needs to be handled by it's own utility or class
		_searchfield.classList.remove('loading');
		results = null;
		
		
		if(_searchScroll !== null){
			_searchScroll.destroy();
			_searchScroll = null;
		}
		
		_searchScroll = new iScroll(_searchresultscard);
		
	}
	
	this.init();
	
}
