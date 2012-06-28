/* 
* jsTimers-rAF hack by Luciano Giuseppe
* Replace javascript timer methods with others that use requestAnimationFrame
* 
* v. 0.2
*/


(function(window) {

window.trAfHack =  {

	//call this function that apply hacks at js timer functions
	applyHacks : function() {
		
		if(this.rAFSupported() == false)
			return;
		
		/*
		 * apply the adapters
		 */
		window.setTimeout = this.setTimeout;
		window.clearTimeout = this.clearTimeout;
		
		window.setInterval = this.setInterval;
		window.clearInterval = this.clearInterval;
	},

	//Control if requestAnimationFrame is supported by browser
	rAFSupported : function() {
		//Erik Möller https://gist.github.com/1579671
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && window.requestAnimationFrame===undefined; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (window.requestAnimationFrame==undefined)
			return false;
		
		
		//if bind is undefined, I need this method for hacks!
		if (Function.prototype.bind === undefined) {  
		  // developer.mozilla.org polyfill
		  Function.prototype.bind = function (oThis) {  
			if (typeof this !== "function") {  
			  // closest thing possible to the ECMAScript 5 internal IsCallable function  
			  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
			}  
		  
			var aArgs = Array.prototype.slice.call(arguments, 1),   
				fToBind = this,   
				fNOP = function () {},  
				fBound = function () {  
				  return fToBind.apply(this instanceof fNOP  
										 ? this  
										 : oThis || window,  
									   aArgs.concat(Array.prototype.slice.call(arguments)));  
				};  
		  
			fNOP.prototype = this.prototype;  
			fBound.prototype = new fNOP();  
		  
			return fBound;  
		  };  
		} 
		
		return true;
	},

	/*
	 * setTimeout hack
	 */

	//setTimeout adapter
	setTimeout : function() {
		if(arguments.length < 2)
			return null;
		
		//create a rafTimeOut object foreach call
		return new trAfHack.rafTimeOut(arguments[0], arguments[1], Array.prototype.slice.call(arguments, 2));
	},

	//clearTimeout adapter
	clearTimeout : function(id) {
		if(id == null)
			return;
			
		//if id is an interval calls clearInterval
		if(id instanceof trAfHack.rafInterval)
			return this.clearInterval(id);
		
		if((id instanceof trAfHack.rafTimeOut) == false || id.rAFID == null)
			return;
			
		cancelAnimationFrame(id.rAFID);
		id.rAFID = null;
	},
	
		//Schedule a timer-based callback using requestAnimationFrame method
	rafTimeOut :  function(callback, delay, params) {
		this.callback = callback;
		this.delay = delay; 
		this.params = params;
		
		//Called every ~16ms until delay is expired
		this.loop = function(timestamp) {
			//Wait the delay time
			if((timestamp - this.rAFStartTime) < this.delay) {
				this.rAFID =  requestAnimationFrame(this.loop.bind(this));
				return;
			}
			
			//call the method or the function
			this.callback.apply(this.callback, this.params);
		};
		
		//Paul Irish  http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
		this.rAFStartTime = window.performance.now ?(performance.now() + performance.timing.navigationStart) : Date.now();	
		this.rAFID = requestAnimationFrame(this.loop.bind(this));
		
		return this;
	}, 
	
	/*
	 * setInterval hack
	 */

	//setInterval adapter
	setInterval : function() {
		if(arguments.length < 2)
			return null;
			
		//create a rafInterval object foreach call
		return new trAfHack.rafInterval(arguments[0], arguments[1], Array.prototype.slice.call(arguments, 2));
	},

	//clearInterval adapter
	clearInterval : function(id) {
		if(id == null)
			return;
		
		//if the id is a rafTimeOut object calls clearTimeout
		if(id instanceof trAfHack.rafTimeOut)
			return clearTimeout(id);
		
		if((id instanceof trAfHack.rafInterval) == false || id.rAFID == null)
			return;
			
		cancelAnimationFrame(id.rAFID);
		id.rAFID = null;
	},

	
	//Schedule a timer-based callback to calls a function repeatedly using requestAnimationFrame method
	rafInterval : function(callback, delay, params) {
		this.callback = callback;
		this.delay = delay; 
		this.params = params;
		
		//Called every ~16ms until delay is expired
		this.loop = function(timestamp) {
			//Wait the delay time
			if((timestamp - this.rAFStartTime) < this.delay) {
				this.rAFID =  requestAnimationFrame(this.loop.bind(this));
				return;
			}
			
			//call the method or the function
			this.callback.apply(this.callback, this.params);
			
			//restart
			this.rAFStartTime = window.performance.now ?(performance.now() + performance.timing.navigationStart) : Date.now();	
			this.rAFID =  requestAnimationFrame(this.loop.bind(this));
		};
		
		//Paul Irish  http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
		this.rAFStartTime = window.performance.now ?(performance.now() + performance.timing.navigationStart) : Date.now();	
		this.rAFID = requestAnimationFrame(this.loop.bind(this));
		
		return this;
	}

};
	
		

	
	
	

	
})(window);
