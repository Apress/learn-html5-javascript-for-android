var app = app || {};

app.playButton = function(id, track){
	
	var canvas = document.getElementById(id),
		context = canvas.getContext('2d'),
		track = track,
		_self = this;
		
	canvas.center = {
			x: (canvas.offsetHeight / 2),
			y: (canvas.offsetHeight / 2)
	};
	
	canvas.dimensions = {
			width: (canvas.offsetWidth),
			height: (canvas.offsetHeight)
	};
	
	/**
	 * Track callback methods
	 */
	track.callbacks.didUpdateTime = function(time){
		_self.draw();
	};
	
	track.callbacks.didPause = function(){
		_self.draw();
	}
	
	/**
	 * Track controls
	 */
	
	this.togglePlay = function(){
		
		switch(track.getState()){
			case track.state.STOPPED:
			case track.state.PAUSED:
				_self.play();
				break;
			case track.state.PLAYING:
				_self.stop();
				break;
		}
		
	}

	this.play = function(){
		track.play();
	};
	
	this.stop = function(){
		track.pause();
	};

	this.drawStop = function(){
		var width = 20,
			height = 20,
			x = canvas.center.x - (width / 2),
			y = canvas.center.y - (height / 2);
			
		context.beginPath();
		context.fillStyle = '#A0A0A0';
		context.fillRect(x, y, width, height);

	};
	
	this.drawPlay = function(){
		var width = 20,
			height = 20,
			x = canvas.center.x - (width / 2),
			y = canvas.center.y - (height / 2);
			
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + width, y + (height / 2));
		context.lineTo(x, (y + height))
		context.fillStyle = '#A0A0A0';
		
		context.fill();

	};
	
	this.draw = function(){
		// Draw the progress bar based on the
		// current time and total time of the track
		var percentage = 100 - ((track.getCurrentTime() / track.getLength()) * 100);
		var endradians = (percentage * (2 / 100)) * Math.PI;
		
		context.clearRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
		
		context.beginPath();
		context.fillStyle = '#000000';
		context.arc(canvas.center.x, canvas.center.y, canvas.center.x - 10, 0, 2 * Math.PI);
		context.fill();
		
		context.beginPath();
		context.arc(canvas.center.x, canvas.center.y, canvas.center.x - 20, 0, 2 * Math.PI);
		context.lineWidth = 5;
		context.strokeStyle = "#FFFFFF";
		context.stroke();
		
		context.beginPath();
		context.arc(canvas.center.x, canvas.center.y, canvas.center.x - 20, 0, endradians);
		context.lineWidth = 5;
		context.strokeStyle = "#A8A8A8";
		context.stroke();

		switch(track.getState()){
			case track.state.PAUSED:
			case track.state.STOPPED:
				this.drawPlay();
				break;
			case track.state.PLAYING:
				this.drawStop();
				break;
		}
		
	};
	
	canvas.addEventListener('touchend', function(e){
		_self.togglePlay();
		e.preventDefault();
	});
	
	this.draw();
};

app.track = function(length){
	
	this.state = {
		STOPPED: 0,
		PLAYING: 1,
		PAUSED: 2
	};
	
	var length = (length * 1000),
		currentTime = 0,
		interval,
		_self = this,
		state = this.state.STOPPED,
		updateInterval = 1000 / 30;
	
	var setCurrentTime = function(time){
		currentTime = time;
		_self.callbacks.didUpdateTime.call(_self, currentTime);
	};
	
	var updateTime = function(){
		
		if(currentTime < length){
			setCurrentTime(currentTime + updateInterval);
		} else {
			_self.stop();
		}
				
	};

	this.getCurrentTime = function(){
		return currentTime;
	};
	
		
	this.getLength = function(){
		return length;
	};
	
	this.getState = function(){
		return state;
	};
	
	this.stop = function(){
		window.clearInterval(interval);
		state = _self.state.STOPPED;
		_self.setCurrentTime(0);
		_self.callbacks.didStop.call(_self);
	};
		
	this.play = function(){
		if(state != _self.state.PLAYING){
			interval = window.setInterval(updateTime, updateInterval);
			state = _self.state.PLAYING;
			_self.callbacks.didStartPlaying.call(_self);
		}
	};
	
	this.pause = function(){
		window.clearInterval(interval);
		state = _self.state.PAUSED;
		_self.callbacks.didPause.call(_self);
	};

	this.callbacks = {
				didUpdateTime: function(time){},
				didStartPlaying: function(){},
				didPause: function(){},
				didStop: function(){}
	};
	
};