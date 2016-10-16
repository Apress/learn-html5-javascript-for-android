var app = app || {};

app.utility = app.utility || {};

app.utility.deck = (function(){
	
	// Keep all of the cards in a local scope
	var _cards = document.getElementsByClassName('card');

	// Return an object with methods
	return {
		// Shows a card by adding the active class
		showCard: function(id){
			document.getElementById(id).classList.add('active');
		},
		// Hides a card by removing the active class
		hideCard: function(id){
			document.getElementById(id).classList.remove('active');
		},
		/*
		 * Hides all cards by iterating through the card list
		 * and removing the active classname
		 */
		hideAllCards: function(){
			for(var i = 0; i < _cards.length; i++){
				_cards[i].classList.remove('active');
			}
		}
	}
	
})();
