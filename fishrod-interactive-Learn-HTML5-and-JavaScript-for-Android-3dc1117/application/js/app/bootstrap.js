var app = app || {};

app.bootstrap = (function(){

	/**
	 * Create the controller object.
	 * You explicitly declare the movies and favourites
	 * controllers.
	 */
	var _controller = {
		movies: null,
		favourites: null
	}
	
	/**
	 * Add a click event listner over the entire document
	 * it will delegate clicks for controllers to the
	 * controller and action.
	 */
	document.addEventListener("click", function(event){

		var target = event.target;
		
		/**
		 * Crawl up the DOM tree from the target element until
		 * the link surrounding the target element is found
		 */	
		while(target.nodeName !== "A" && target.getAttribute('data-controller') == null && target.getAttribute('data-action') == null){
			
			// We've reached the body element break!
			if(target.parentNode.nodeName == 'HTML'){
				target = null;
				break;
			}
			// Asign the target.paretNode to the target variable
			target = target.parentNode;
		}
		
		/**
		 * If there's a target, then process the link action
		 */
		if(target){
			
			/**
			 * You have the target link so it makes sense to prevent the link from following through now
			 * this will allow any JavaScript to fail silently!
			 */ 
			event.preventDefault();
			
			// Get the controller, action and params from the element
			var controller = target.getAttribute('data-controller'), action = target.getAttribute('data-action'), params = target.getAttribute('data-params');
			
			// Check to see whether the controller exists in the bootstrap and the action is available
			if(typeof _controller[controller] === 'undefined'
				|| typeof _controller[controller][action] === 'undefined'){
				// If they don't exist, throw an exception
				throw "Action " + action + " for controller " + controller + " doesn't appear to exist";
				return;
			}
			
			// Check to see whether the params exist
			if(params){
				try {
					// If they do, then parse them as JSON
					params = JSON.parse(params);
				} catch (e) {
					// If there's a parsing exception, set the params to be null
					params = null;
					return;
				}
			
			}			

			/**
			 * Execute the controller within the context of the target,
			 * this will allos you to access the original element from
			 * the controller action. Also pass the parameters from the
			 * data-params attribute.
			 */ 
			_controller[controller][action].call(target, params);

		}
		
	});
	
	/**
	 * Setup the local storage by checking to see whether
	 * the favourites item exists
	 */ 
	if(!localStorage.getItem('favourites')){
		// if it doesn't create an empty array and assign it to the storage
		var favourites = [];
		localStorage.favourites = JSON.stringify(favourites);
	}
	
	return {
		/**
		 * Create an accessor for the controller,
		 * it accepts a string representation of the
		 * controllers namespace
		 */
		getController: function(name){
			
			/**
			 * Split the string into an array using the .
			 * character to seperate the string
			 */ 
			var parts = name.split('.');
			
			/**
			 * Initially set the returned controller to null
			 */
			var returnController = null;
			
			/**
			 * If the number of parts is greater than 0
			 */
			if(parts.length > 0){
				/**
				 * Set the return controller to the parent object
				 */
				returnController = _controller;
				/**
				 * Loop through each part gradually assigning the action to the
				 * return controller
				 */
				for(var i = 0; i < parts.length; i++){
					returnController = returnController[parts[i]];
				}
			}
			
			/**
			 * Return the controller
			 */
			return returnController;
		},
		
		/**
		 * Initialises all of the controllers, you may not want to do this
		 * automatically, so you can use the initScripts method to execute it
		 */
		initScripts: function(){
			_controller.movies = new app.controller.movies();
			_controller.favourites = new app.controller.favourites();
			_controller.favourites.list();
		}
	}
	
})();
