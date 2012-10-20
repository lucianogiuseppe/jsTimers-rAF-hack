jsTimers-rAF hack by Luciano Giuseppe
Replaces javascript timer methods with others that use requestAnimationFrame.
jsTimers-rAF hack is useful if you want use requestAnimationFrame into your scripts without change the code or if you want to use a own version of setTimeout and setInterval methods.

v. 0.4
now it works on IE10	

v. 0.3
fixed window.performance.now check for opera

v. 0.2
+ Added setInterval and clearInterval adapters
+ Added rAFSupported method to check if requestAnimationFrame is supported by browser

v. 0.1
setTimeout and clearTimeout adapters
