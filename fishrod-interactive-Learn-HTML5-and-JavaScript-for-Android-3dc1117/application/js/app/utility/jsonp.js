var app = app || {};

app.utility = app.utility || {};

app.utility.jsonp = function(url, callbackmethod){
	
	var _src = url + '&callback=' + callbackmethod;
	var _script = document.createElement('script');
	
	/**
	 * Set the source of the script element to be the same as the on specified above
	 */
	_script.src = _src;
	_script.async = "async";
	
	/**
	 * Once the script has loaded the function will execute and the
	 * script tag can be removed from the head of the document
	 */
	_script.onload = _script.onreadystatechange = function(load){
		console.log(load.target);
		var script = document.head.removeChild(load.target);
		script = null;
	}

	this.send = function(){
		document.head.appendChild(_script);
	}
}
