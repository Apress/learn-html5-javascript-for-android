var app = app || {};

app.utility = app.utility || {};

app.utility.layout = (function(){
	
	/**
	 * This method will adjust the height of all decks
	 * so that there is space at the top for the taskbar
	 * which has an unpredictable height
	 */
	var fixdeckheight = function(){
	
		/**
		 * First loop through each deck
		 */
		[].forEach.call(document.getElementsByClassName('deck'), function(el){
			/**
			 * And set the height of the deck by subtracting the height of
			 * the taskbar from the height of the document body
			 */
			el.style.height = (document.body.offsetHeight - document.getElementById('taskbar').offsetHeight) + 'px';
		});
		
	};
	
	/**
	 * Create a timeout variable, it may take a while
	 * for the new sizes to update in some browsers
	 */
	var timeout;
	
	/**
	 * Add an event listener to the window so that when
	 * it's resized, it will clear the timeout, 
	 */
	window.addEventListener('resize', function(){
		// Clear the timeout just incase it's set, this prevents multiple calls
		clearTimeout(timeout);
		/*
		 * Set the timeout to 100ms and execute fixdeckheight at the end of the timeout
		 */ 
		timeout = setTimeout(function(){ fixdeckheight(); }, 100);
	});
	
	// Call fixdeckheight for the first time
	fixdeckheight();	
	
})();