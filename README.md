Parallel-ES6
===========
Complement for Wait.for-ES6: Sequential programming for node.js *and the browser*, end of callback hell.

check first: [Wait.for-ES6] (http://github.com/luciotato/waitfor-ES6),

***Simple, straightforward abstraction.***

By using *parallel* and **wait.for**, you can call any nodejs standard async function in sequential/Sync mode, waiting for result data, 
without blocking node's event loop.

Definitions:
---
* A nodejs standard async function is a function in which the last parameter is a callback: function(err,data)
* A "fiber" in this context is a "generator" that yields async callable functions.


*Advantages:*
<ul>
<li> Avoid callback hell / pyramid of doom
<li> Simpler, sequential programming when required, without blocking node's event loop
<li> Simpler, try-catch exception programming. (default callback handler is: if (err) throw err; else return data)
<li> You can launch multiple parallel non-concurrent fibers.
<li> No multi-threaded debugging nightmares, only one fiber running at a given time.
<li> Can use any node-standard async function with callback(err,data) as last parameter.
<li> Plays along with node programming style. Write your async functions with callback(err,data), but use them in sequential/SYNC mode when required.
<li> Plays along with node cluster. You design for one thread/processor, then scale with cluster on multicores.
</ul>

- WARNING: Bleeding Edge -
--

This uses a port of the original [Wait.for] (http://github.com/luciotato/waitfor),
now implemented using ***the upcoming*** javascript/ES6-Harmony generators.
It requires ***bleeding edge node v0.11.6, with --harmony command line option***

This lib is based on ECMAScript 6 "Harmony", the next version of the javascript standard, target release date December 2013.

This lib also uses bleeding edge V8 Harmony features, so you’ll need to use the latest (unstable) nodejs version (v0.11.6) 
and also pass the --harmony flag when executing node.

Example:

    node --harmony server.js


Install : 
-
        npm install parallel-es6 

Examples:
-
```javascript
// (inside a generator) call async function fs.readfile(path,enconding), 
// wait for result, return data
console.log('contents of file: ', yield wait.for(fs.readfile, '/etc/file.txt', 'utf8'));
```

DNS testing, *using pure node.js* (a little of callback hell):
```javascript
var dns = require("dns");
    
function test(){ 
	dns.resolve4("google.com", function(err, addresses) {
		if (err) throw err;
		for (var i = 0; i < addresses.length; i++) {
			var a = addresses[i];
			dns.reverse(a, function (err, data) {
				if (err) throw err;
				console.log("reverse for " + a + ": " + JSON.stringify(data));
			});
		};
	});
}

test();
```
***The same code***, using **wait.for** and **parallel** (faster): 
```javascript
var dns = require("dns"), wait=require('wait.for-ES6');

function* getReverse(addr){
    return yield wait.for(dns.reverse,addr);
}

function* test(){
         var addresses = yield wait.for(dns.resolve4,"google.com");
         var reverses = yield wait.for(parallel.map,addresses, getReverse);
         console.log("reverses", reverses);
}

wait.launchFiber(test); 
```

Alternative, **fancy syntax**, *omiting* **wait.for** 
```javascript
function* getReverse(addr){
    return yield [dns.reverse,addr];
}

function* test(){
         var addresses = yield [dns.resolve4,"google.com"];
         var reverses = yield [parallel.map,addresses, getReverse];
         console.log("reverses", reverses);
}
wait.launchFiber(test); 
```

More examples:

* see  [test.js] (http://github.com/luciotato/parallel-ES6/tree/master/test) 

