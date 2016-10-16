/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2011-06-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

(function (view) {

"use strict";

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.className)
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.className = this.toString();
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function (token) {
	token += "";
	if (checkTokenAndGetIndex(this, token) === -1) {
		this.push(token);
		this._updateClassName();
	}
};
classListProto.remove = function (token) {
	token += "";
	var index = checkTokenAndGetIndex(this, token);
	if (index !== -1) {
		this.splice(index, 1);
		this._updateClassName();
	}
};
classListProto.toggle = function (token) {
	token += "";
	if (checkTokenAndGetIndex(this, token) === -1) {
		this.add(token);
	} else {
		this.remove(token);
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}

/*!
 * iScroll Lite base on iScroll v4.1.6 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */

(function(){
var m = Math,
	mround = function (r) { return r >> 0; },
	vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
		(/firefox/i).test(navigator.userAgent) ? 'Moz' :
		'opera' in window ? 'O' : '',

    // Browser capabilities
    isAndroid = (/android/gi).test(navigator.appVersion),
    isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
    isPlaybook = (/playbook/gi).test(navigator.appVersion),
    isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
    hasTouch = 'ontouchstart' in window && !isTouchPad,
    hasTransform = vendor + 'Transform' in document.documentElement.style,
    hasTransitionEnd = isIDevice || isPlaybook,

	nextFrame = (function() {
	    return window.requestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function(callback) { return setTimeout(callback, 17); }
	})(),
	cancelFrame = (function () {
	    return window.cancelRequestAnimationFrame
			|| window.webkitCancelAnimationFrame
			|| window.webkitCancelRequestAnimationFrame
			|| window.mozCancelRequestAnimationFrame
			|| window.oCancelRequestAnimationFrame
			|| window.msCancelRequestAnimationFrame
			|| clearTimeout
	})(),

	// Events
	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',

	// Helpers
	trnOpen = 'translate' + (has3d ? '3d(' : '('),
	trnClose = has3d ? ',0)' : ')',

	// Constructor
	iScroll = function (el, options) {
		var that = this,
			doc = document,
			i;

		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
		that.wrapper.style.overflow = 'hidden';
		that.scroller = that.wrapper.children[0];

		// Default options
		that.options = {
			hScroll: true,
			vScroll: true,
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (e) { e.preventDefault(); },
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null
		};

		// User defined options
		for (i in options) that.options[i] = options[i];

		// Set starting position
		that.x = that.options.x;
		that.y = that.options.y;

		// Normalize options
		that.options.useTransform = hasTransform ? that.options.useTransform : false;
		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

		// Set some default styles
		that.scroller.style[vendor + 'TransitionProperty'] = that.options.useTransform ? '-' + vendor.toLowerCase() + '-transform' : 'top left';
		that.scroller.style[vendor + 'TransitionDuration'] = '0';
		that.scroller.style[vendor + 'TransformOrigin'] = '0 0';
		if (that.options.useTransition) that.scroller.style[vendor + 'TransitionTimingFunction'] = 'cubic-bezier(0.33,0.66,0.66,1)';
		
		if (that.options.useTransform) that.scroller.style[vendor + 'Transform'] = trnOpen + that.x + 'px,' + that.y + 'px' + trnClose;
		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

		that.refresh();

		that._bind(RESIZE_EV, window);
		that._bind(START_EV);
		if (!hasTouch) that._bind('mouseout', that.wrapper);
	};

// Prototype
iScroll.prototype = {
	enabled: true,
	x: 0,
	y: 0,
	steps: [],
	scale: 1,
	
	handleEvent: function (e) {
		var that = this;
		switch(e.type) {
			case START_EV:
				if (!hasTouch && e.button !== 0) return;
				that._start(e);
				break;
			case MOVE_EV: that._move(e); break;
			case END_EV:
			case CANCEL_EV: that._end(e); break;
			case RESIZE_EV: that._resize(); break;
			case 'mouseout': that._mouseout(e); break;
			case 'webkitTransitionEnd': that._transitionEnd(e); break;
		}
	},

	_resize: function () {
		this.refresh();
	},
	
	_pos: function (x, y) {
		x = this.hScroll ? x : 0;
		y = this.vScroll ? y : 0;

		if (this.options.useTransform) {
			this.scroller.style[vendor + 'Transform'] = trnOpen + x + 'px,' + y + 'px' + trnClose + ' scale(' + this.scale + ')';
		} else {
			x = mround(x);
			y = mround(y);
			this.scroller.style.left = x + 'px';
			this.scroller.style.top = y + 'px';
		}

		this.x = x;
		this.y = y;
	},

	_start: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			matrix, x, y;

		if (!that.enabled) return;

		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);
		
		if (that.options.useTransition) that._transitionTime(0);

		that.moved = false;
		that.animating = false;
		that.zoomed = false;
		that.distX = 0;
		that.distY = 0;
		that.absDistX = 0;
		that.absDistY = 0;
		that.dirX = 0;
		that.dirY = 0;

		if (that.options.momentum) {
			if (that.options.useTransform) {
				// Very lame general purpose alternative to CSSMatrix
				matrix = getComputedStyle(that.scroller, null)[vendor + 'Transform'].replace(/[^0-9-.,]/g, '').split(',');
				x = matrix[4] * 1;
				y = matrix[5] * 1;
			} else {
				x = getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '') * 1;
				y = getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '') * 1;
			}
			
			if (x != that.x || y != that.y) {
				if (that.options.useTransition) that._unbind('webkitTransitionEnd');
				else cancelFrame(that.aniTime);
				that.steps = [];
				that._pos(x, y);
			}
		}

		that.startX = that.x;
		that.startY = that.y;
		that.pointX = point.pageX;
		that.pointY = point.pageY;

		that.startTime = e.timeStamp || Date.now();

		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

		that._bind(MOVE_EV);
		that._bind(END_EV);
		that._bind(CANCEL_EV);
	},
	
	_move: function (e) {
		var that = this,
			point = hasTouch ? e.touches[0] : e,
			deltaX = point.pageX - that.pointX,
			deltaY = point.pageY - that.pointY,
			newX = that.x + deltaX,
			newY = that.y + deltaY,
			timestamp = e.timeStamp || Date.now();

		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

		that.pointX = point.pageX;
		that.pointY = point.pageY;

		// Slow down if outside of the boundaries
		if (newX > 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
		}
		if (newY > 0 || newY < that.maxScrollY) { 
			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= 0 || that.maxScrollY >= 0 ? 0 : that.maxScrollY;
		}

		that.distX += deltaX;
		that.distY += deltaY;
		that.absDistX = m.abs(that.distX);
		that.absDistY = m.abs(that.distY);

		if (that.absDistX < 6 && that.absDistY < 6) {
			return;
		}

		// Lock direction
		if (that.options.lockDirection) {
			if (that.absDistX > that.absDistY + 5) {
				newY = that.y;
				deltaY = 0;
			} else if (that.absDistY > that.absDistX + 5) {
				newX = that.x;
				deltaX = 0;
			}
		}

		that.moved = true;
		that._pos(newX, newY);
		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if (timestamp - that.startTime > 300) {
			that.startTime = timestamp;
			that.startX = that.x;
			that.startY = that.y;
		}
		
		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
	},
	
	_end: function (e) {
		if (hasTouch && e.touches.length != 0) return;

		var that = this,
			point = hasTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX = { dist:0, time:0 },
			momentumY = { dist:0, time:0 },
			duration = (e.timeStamp || Date.now()) - that.startTime,
			newPosX = that.x,
			newPosY = that.y,
			newDuration;

		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);

		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

		if (!that.moved) {
			if (hasTouch) {
				// Find the last touched element
				target = point.target;
				while (target.nodeType != 1) target = target.parentNode;

				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
					ev = document.createEvent('MouseEvents');
					ev.initMouseEvent('click', true, true, e.view, 1,
						point.screenX, point.screenY, point.clientX, point.clientY,
						e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
						0, null);
					ev._fake = true;
					target.dispatchEvent(ev);
				}
			}

			that._resetPos(200);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		if (duration < 300 && that.options.momentum) {
			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

			newPosX = that.x + momentumX.dist;
			newPosY = that.y + momentumY.dist;

 			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
 			if ((that.y > 0 && newPosY > 0) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
		}

		if (momentumX.dist || momentumY.dist) {
			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

			that.scrollTo(mround(newPosX), mround(newPosY), newDuration);

			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
			return;
		}

		that._resetPos(200);
		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
	},
	
	_resetPos: function (time) {
		var that = this,
			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
			resetY = that.y >= 0 || that.maxScrollY > 0 ? 0 : that.y < that.maxScrollY ? that.maxScrollY : that.y;

		if (resetX == that.x && resetY == that.y) {
			if (that.moved) {
				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
				that.moved = false;
			}

			return;
		}

		that.scrollTo(resetX, resetY, time || 0);
	},
	
	_mouseout: function (e) {
		var t = e.relatedTarget;

		if (!t) {
			this._end(e);
			return;
		}

		while (t = t.parentNode) if (t == this.wrapper) return;
		
		this._end(e);
	},

	_transitionEnd: function (e) {
		var that = this;

		if (e.target != that.scroller) return;

		that._unbind('webkitTransitionEnd');
		
		that._startAni();
	},

	/**
	 *
	 * Utilities
	 *
	 */
	_startAni: function () {
		var that = this,
			startX = that.x, startY = that.y,
			startTime = Date.now(),
			step, easeOut,
			animate;

		if (that.animating) return;

		if (!that.steps.length) {
			that._resetPos(400);
			return;
		}

		step = that.steps.shift();

		if (step.x == startX && step.y == startY) step.time = 0;

		that.animating = true;
		that.moved = true;

		if (that.options.useTransition) {
			that._transitionTime(step.time);
			that._pos(step.x, step.y);
			that.animating = false;
			if (step.time) that._bind('webkitTransitionEnd');
			else that._resetPos(0);
			return;
		}
		
		animate = function () {
			var now = Date.now(),
				newX, newY;

			if (now >= startTime + step.time) {
				that._pos(step.x, step.y);
				that.animating = false;
				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
				that._startAni();
				return;
			}

			now = (now - startTime) / step.time - 1;
			easeOut = m.sqrt(1 - now * now);
			newX = (step.x - startX) * easeOut + startX;
			newY = (step.y - startY) * easeOut + startY;
			that._pos(newX, newY);
			if (that.animating) that.aniTime = nextFrame(animate);
		};
		
		animate();
	},

	_transitionTime: function (time) {
		this.scroller.style[vendor + 'TransitionDuration'] = time + 'ms';
	},
	
	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
		var deceleration = 0.0006,
			speed = m.abs(dist) / time,
			newDist = (speed * speed) / (2 * deceleration),
			newTime = 0, outsideDist = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistUpper = maxDistUpper + outsideDist;
			speed = speed * maxDistUpper / newDist;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			outsideDist = size / (6 / (newDist / speed * deceleration));
			maxDistLower = maxDistLower + outsideDist;
			speed = speed * maxDistLower / newDist;
			newDist = maxDistLower;
		}

		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: newDist, time: mround(newTime) };
	},

	_offset: function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;
			
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		} 

		return { left: left, top: top };
	},

	_bind: function (type, el, bubble) {
		(el || this.scroller).addEventListener(type, this, !!bubble);
	},

	_unbind: function (type, el, bubble) {
		(el || this.scroller).removeEventListener(type, this, !!bubble);
	},


	/**
	 *
	 * Public methods
	 *
	 */
	destroy: function () {
		var that = this;

		that.scroller.style[vendor + 'Transform'] = '';

		// Remove the event listeners
		that._unbind(RESIZE_EV, window);
		that._unbind(START_EV);
		that._unbind(MOVE_EV);
		that._unbind(END_EV);
		that._unbind(CANCEL_EV);
		that._unbind('mouseout', that.wrapper);
		if (that.options.useTransition) that._unbind('webkitTransitionEnd');
		
		if (that.options.onDestroy) that.options.onDestroy.call(that);
	},

	refresh: function () {
		var that = this,
			offset;

		that.wrapperW = that.wrapper.clientWidth;
		that.wrapperH = that.wrapper.clientHeight;

		that.scrollerW = that.scroller.offsetWidth;
		that.scrollerH = that.scroller.offsetHeight;
		that.maxScrollX = that.wrapperW - that.scrollerW;
		that.maxScrollY = that.wrapperH - that.scrollerH;
		that.dirX = 0;
		that.dirY = 0;

		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

		offset = that._offset(that.wrapper);
		that.wrapperOffsetLeft = -offset.left;
		that.wrapperOffsetTop = -offset.top;


		that.scroller.style[vendor + 'TransitionDuration'] = '0';

		that._resetPos(200);
	},

	scrollTo: function (x, y, time, relative) {
		var that = this,
			step = x,
			i, l;

		that.stop();

		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
		
		for (i=0, l=step.length; i<l; i++) {
			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
		}

		that._startAni();
	},

	scrollToElement: function (el, time) {
		var that = this, pos;
		el = el.nodeType ? el : that.scroller.querySelector(el);
		if (!el) return;

		pos = that._offset(el);
		pos.left += that.wrapperOffsetLeft;
		pos.top += that.wrapperOffsetTop;

		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
		pos.top = pos.top > 0 ? 0 : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

		that.scrollTo(pos.left, pos.top, time);
	},

	disable: function () {
		this.stop();
		this._resetPos(0);
		this.enabled = false;

		// If disabled after touchstart we make sure that there are no left over events
		this._unbind(MOVE_EV);
		this._unbind(END_EV);
		this._unbind(CANCEL_EV);
	},
	
	enable: function () {
		this.enabled = true;
	},
	
	stop: function () {
		cancelFrame(this.aniTime);
		this.steps = [];
		this.moved = false;
		this.animating = false;
	}
};

if (typeof exports !== 'undefined') exports.iScroll = iScroll;
else window.iScroll = iScroll;

})();

var app = app || {};

app.utility = app.utility || {};

/**
 * Validator object has static methods
 * to check to easily validate values
 */

app.utility.validator = {

	/**
	 * Checks to see whether a value is empty or not
	 * returns true if it is, or false if it isn't
	 * @param {String|Object} value
	 * @return {Bool}
	 */
	isEmpty: function(value){
	
		if(value == '' || value == null || value === false){
			return true;	
		}
		
		return false;
	
	},

	/**
	 * Checks to see whether a value is a type of object
	 * returns true if it is, or false if it isn't
	 * @param {Object} value
	 * @param {String|Object} type
	 * @return {Bool}
	 */
	isTypeOf: function(value, type){
		
		// First check to see if the type is a string
		if(typeof type == "string"){
			// If it is, we're probably checking against a primative type
			if(typeof value == type){
				return true;
			}
			
		} else {
			// We're dealing with an object comparison	
			if(value instanceof type){
				return true;
			}
			
		}
		
		return false;
	}
}

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

var app = app || {};

app.type = app.type || {};

/**
 * The media type, can be used to
 * define mime types of objects
 * @param {String} name
 * @param {String} format
 * @param {String} mime
 */

app.type.format = function(name, format, mime){
		
	/**
	 * The media's instance variables
	 */
	var _name,
		_format,
		_mime,
		_self = this;
	
	this.init = function(){
		/**
		 * Set the instance variables using the constructors arguments
		 */
		this.setName(name);
		this.setFormat(format);
		this.setMime(mime);
	}
	
	/**
	 * Getters and setters
	 */

	/**
	 * Gets the name of the media type
	 * @return {String}
	 */
	this.getName = function(){
		return _name;
	}
	
	/**
	 * Sets the name of the media type
	 * @param {String} name
	 */
	this.setName = function(name){
		_name = name;
	}
	
	/**
	 * Gets the format of the media i.e. webm, ogv
	 * @return {String}
	 */
	this.getFormat = function(){
		return _format;
	}
	
	/**
	 * Sets the format of the media
	 * @param {String} format
	 */
	this.setFormat = function(format){
		_format = format;
	}
	
	/**
	 * Gets the mime type of the media
	 * @return {String}
	 */
	this.getMime = function(){
		return _mime;
	}
	
	/**
	 * Sets the mime type of the media
	 * @param {String} mime
	 */
	this.setMime = function(mime){
		_mime = mime;
	}
	
	this.init();
	
}

var app = app || {};

app.type = app.type || {};

/**
 * The a movie release date,
 * The constructor takes the cinema release date and dvd release date
 * @param {Date} cinema
 * @param {Date} dvd
 */
app.type.releaseDate = function(cinema, dvd){
	
	/**
	 * The release date instance variables
	 */
	var _dvd,
		_cinema;
	
	this.init = function(){
		/**
		 * Sets the instance variables using setters
		 */
		this.setDvd(dvd);
		this.setCinema(cinema);
	}
	
	/**
	 * Gets the DVD release date
	 */
	this.getDvd = function(){
		return _dvd;
	}
	
	/**
	 * Sets the DVD release date
	 */
	this.setDvd = function(dvd){
		_dvd = dvd;
	}
	
	/**
	 * Gets the cinema release date
	 */
	this.getCinema = function(){
		return _cinema;
	}
	
	/**
	 * Sets the cinema release date
	 */
	this.setCinema = function(cinema){
		_cinema = cinema;
	}
	
	this.init();
	
}
var app = app || {};

app.model = app.model || {};

/**
 * The actor class handles the actors for a movie.
 * Actors should only be included in a full movie listing
 * @param {String} name
 * @param {String} role
 */
app.model.actor = function appModelActor(name, role){
	
	/**
	 * The actors instance variables
	 */
	var _name,
		_role,
		_self = this;
	
	/**
	 * Set the instance variables using the constructors arguments
	 */
	this.init = function(){
		this.setName(name);
		this.setRole(role);
	}
	
	/**
	 * Getters and setters
	 */
	
	/**
	 * Returns the fullname name of the actor
	 * @return {String}
	 */
	this.getName = function(){
		return _name;
	}
	
	/**
	 * Sets the actors full name
	 * @param {String} name
	 */
	this.setName = function(name){
		_name = name;
	}

	/**
	 * Gets the role of the actor in
	 * relation to the associated film
	 * @return {String}
	 */
	this.getRole = function(){
		return _role;
	}
	
	/**
	 * Sets the actors role in relation
	 * to the associated film
	 * @param {String} role
	 */
	this.setRole = function(role){
		_role = role;
	}
	
	this.init();
		
}
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
var app = app || {};

app.model = app.model || {};

/**
 * A video associated with a movie.
 * You must add video sources in order for videos to play
 * @param {String} title
 * @param {Integer} length
 * @param {String} posterframe
 */

app.model.video = function appModelVideo(title, length, posterframe){

	/**
	 * The videos instance variables
	 */
	var _title,
		_length,
		_posterframe,
		_sources = [],
		_self = this,
		validator = app.utility.validator;
	
	/**
	 * Set the instance variables using the constructors arguments
	 */
	
	this.init = function(){
		this.setTitle(title);
		this.setLength(length);
		this.setPosterframe(posterframe);
	}
	
	/**
	 * The getters and setters
	 */
	
	/**
	 * Gets the title of the video
	 * @return {String}
	 */
	this.getTitle = function(){
		return _title;
	}
	
	/**
	 * Sets the title of the video
	 * @param {String} title
	 */
	this.setTitle = function(title){
		_title = title;
	}
	
	/**
	 * Gets the length of the video in milliseconds
	 * @return {Integer}
	 */
	this.getLength = function(){
		return _length;
	}
	
	/**
	 * Sets the length of the video in milliseconds
	 * @param {Integer} length
	 */
	this.setLength = function(length){
		
		if(!validator.isTypeOf(length, "number")){
			throw {
				message: "The source property in the video model requires an 'Array' type",
				type: "validation_exception"
			}
			return;
		}
		
		_length = length;
	}
	
	/**
	 * Gets all of the video sources used for embedding video
	 * in POSH
	 * @return {Array}
	 */
	this.getSources = function(){
		return _sources;
	}
	
	/**
	 * Gets the source at a specific index
	 * @param {Integer} index
	 * @return {app.model.videosource} source
	 */
	this.getSource = function(index){
		return _sources[index];
	}
	
	/**
	 * Removes a source at a specific index
	 * @param {Integer} index
	 */
	this.removeSource = function(index){
				
		// Check to see whether the index is an integer
		if(!validator.isTypeOf(index, "number")){
			throw {
				message: "The source property in the video model requires an 'Array' type",
				type: "validation_exception"
			}
			return;
		}
		
		/*
		 * Check to see whether the index is greater than the sources length,
		 * you can fail silently here as this method doesn't return anything
		 */
		
		
		_sources.splice(index, 1);
	}
	
	/**
	 * Sets all video sources using an array
	 * @param {Array} sources
	 */
	this.setSources = function(sources){
		
		// Check to see whether sources is an array
		if(!validator.isTypeOf(sources, Array)){
			throw {
				message: "The source property in the video model requires an 'Array' type",
				type: "validation_exception"
			}
			return;
		}
		
		_sources.length = 0;
		
		/**
		 * Rather than setting the sources all in one go
		 * you use the addSource method which can handle
		 * any validation for each source before it's
		 * added to the object
		 */
		for(var i = 0; i < sources.length; i++){
			_self.addSource(sources[i]);
		}
	}
	
	/**
	 * Adds a source to the sources array
	 * @param {app.model.videosource} source
	 */
	this.addSource = function(source){
		_sources.push(source);
	}
	
	this.init();

}
var app = app || {};

app.model = app.model || {};

/**
 * A video source used within a video
 * you must add this object to a video once instantiated
 * @param {String} url
 * @param {app.type.format} format
 */
app.model.videosource = function appModelVideoSource(url, format){
	
	/**
	 * The video sources instance variables
	 */
	var _url,
		_format,
		_self = this,
		validator = app.utility.validator;
	
	
	/**
	 * Set the instance variables using the constructors arguments
	 */
	this.init = function(){
		this.setUrl(url);
		this.setFormat(format);
	}
	
	/**
	 * Getters and setters
	 */
	
	/**
	 * Gets the url of the video source
	 * @return {String}
	 */
	this.getUrl = function(){
		return _url;
	}
	
	/**
	 * Sets the url of the video source
	 * @param {String} url
	 */
	this.setUrl = function(url){
		
		if(!validator.isTypeOf(url, "string")){
			throw {
				message: "The url property in the videosource model requires a 'string' type",
				type: "validation_exception"
			}
			return;
		}
		
 		_url = url;
	}
	
	/**
	 * Gets the mimetype of the video source
	 * @return {app.type.format}
	 */
	this.getFormat = function(){
		return _format;
	}
	
	/**
	 * Sets the mimetype of the video source
	 * @param {app.type.format} format
	 */
	this.setFormat = function(format){
		
		if(!validator.isTypeOf(format, app.type.format)){
			throw {
				message: "The format property in the videosource model requires a 'app.type.format' type",
				type: "validation_exception"
			}
			return;
		}
		
		_format = format;
	}
	
	this.init();
	
}
var app = app || {};
app.view = app.view || {};

/**
 * Creates a new view for a movie list item
 * @param {app.model.movie} movie
 */
app.view.movie = function(movie){
	
	var _rootElement = document.createElement('div');
		_rootElement.innerHTML = [
			'<header class="movie-header">',
				'<img src="', movie.getPosterframe() ,'" alt="', movie.getTitle() , '" class="poster" width="100%" />',
				'<hgroup class="movie-title">',
					'<a href="#" class="btn-favourite add" data-controller="favourites" data-action="add" data-params=\'{"id": "', movie.getRtid() ,'", "title": "', escape(movie.getTitle()) ,'", "synopsis": "', escape(movie.getSynopsis()) ,'", "posterframe": "', movie.getPosterframe() ,'"}\'>favourite</a>',
					'<h2>', movie.getTitle(),'</h2>',
					'<p class="movie-release-date">Cinematic Release - ', movie.getReleaseDate().getCinema().getDate(), '/',  movie.getReleaseDate().getCinema().getMonth() + 1 , '/',  movie.getReleaseDate().getCinema().getFullYear() ,'</p>',
				'</hgroup>',
			'</header>',
			
			'<div class="movie-content">',
				'<div class="block-container span-three">',
				
					'<section class="block" id="block-synopsis">',
						'<div class="content">',
							'<p>', movie.getSynopsis() ,'</p>',
						'</div>',
					'</section>',
					
					'<section class="block" id="block-cast">',
						'<div class="content">',
							'<h3>Cast List</h3>',
							'<ul class="list"></ul>',
						'</div>',
					'</section>',
					
					'<section class="block" id="block-video">',
						'<div class="content">',
							'<h3>Video Clips</h3>',
							'<ul class="list grid"></ul>',
						'</div>',
					'</section>',
				'</div>',
			'</div>',
			
			'<footer class="footer screenbar">',
				'<a class="back" href="/" data-controller="favourites" data-action="list">my favourites</a>',
			'</footer>'
					
		].join('');
		
		// Check to see whether the movie is in the users favourites
		if(movie.isFavourite()){
			var _favouriteButton = _rootElement.querySelector('a.btn-favourite');
			_favouriteButton.setAttribute('data-action', 'remove');
			_favouriteButton.classList.remove('add');
			_favouriteButton.classList.add('remove');
			_favouriteButton.textContent = 'un-favourite';
		}
		
		for(var i = 0; i < movie.getActors().length; i++){
			var actor = movie.getActor(i);
			var element = document.createElement('li');
			element.innerHTML = [
				'<p>', actor.getName(), '<br />',
				'<em>', actor.getRole(), '</em></p>'
			].join('');
			_rootElement.querySelector('#block-cast ul.list').appendChild(element);
		}

	this.render = function(){
		return _rootElement;
	}

}
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
	_rootElement.classList.add('alternating');
	_rootElement.classList.add('medium');
	_rootElement.classList.add('movie-list');
	
	for(var i = 0; i < results.length; i++){
		var itemView = new app.view.movielistitem(results[i]);
		_rootElement.appendChild(itemView.render());
	}
	
	this.render = function(){
		return _rootElement;
	}
	
}

var app = app || {};

app.controller = app.controller || {};

app.controller.movies = function(){
	
	var _self = this,
		_searchfield = document.querySelector('#add-movie input[name="query"]'),
		_searchform = document.getElementById('add-movie'),
		_searchresultscard = document.getElementById('card-movie_search_results'),
		_searchTimeout,
		_viewScrolls = [],
		_searchScroll = null;
	
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
		
		var jsonp = new app.utility.jsonp('http://api.rottentomatoes.com/api/public/v1.0/movies/' + data.id + '.json?apikey=57t3sa6sp5zz5394btptp9ew', 'app.bootstrap.getController("movies").view');
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
		
		[].forEach.call(viewcard.getElementsByClassName('block'), function(el){
			
			_viewScrolls.push(new iScroll(el, {hScroll: false, hScrollbar: false}));
			
		});
		
		window.addEventListener('resize', function(){
			setTimeout(function(){
				
				_searchScroll.refresh();
				
				for(var i = 0; i < _viewScrolls.length; i++){
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
