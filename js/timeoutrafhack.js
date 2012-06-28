/* 
 * setTimeOut-rAF hack by Luciano Giuseppe
 * Replace setTimeout method with another that uses requestAnimationFrame
 * 
 * v. 0.1
 */
 
(function (window) {

//To replace setTimeout
function timeOutRafHack() {
	
	//Erik Möller https://gist.github.com/1579671
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && window.requestAnimationFrame===undefined; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (window.requestAnimationFrame==undefined)
		return;
	
	//if bind is undefined
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
	
	 
	/*
	 * apply the adapters
	 */
	window.setTimeout = timeOutAdapter;
	window.clearTimeout = clearTimeoutAdapter;
}


//setTimeout adapter
function timeOutAdapter() {
	//create a rafTimeOut object foreach call
	return new rafTimeOut(arguments[0], arguments[1], Array.prototype.slice.call(arguments, 2));
}

//Schedule a timer-based callback using requestAnimationFrame method
function rafTimeOut(callback, delay, params) {
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
}

//clearTimeout adapter
function clearTimeoutAdapter(id) {
	cancelAnimationFrame(id.rAFID);
	id=null;
}


//call the function that apply the hack
timeOutRafHack();

})(window);