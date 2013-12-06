//"use strict";
var util = require("util");
var dns = require("dns");
var wait = require("wait.for-es6");
var parallel = require("../parallel");

// ----------------------
// DNS TESTS --------
// ----------------------

function* getReverse(addr){
    return yield wait.for(dns.reverse,addr);
}

function* parallel_reverse(hostname){

    console.log('\n\n---------------------------');
    console.log('parallel_reverse');
    console.log('---------------------------');
    console.log('\ndns.resolve4 ',hostname);
    var addresses = yield wait.for(dns.resolve4,hostname);
    console.log("\naddresses: ",JSON.stringify(addresses));
    var reversed = yield wait.for(parallel.map, addresses, getReverse);
    console.log("\nreversed : ",JSON.stringify(reversed));
}


function* sequential_reverse(hostname){
    console.log('\n\n---------------------------');
    console.log('sequential_reverse');
    console.log('---------------------------');
    console.log('dns.resolve4 ',hostname);
    var addresses = yield wait.for(dns.resolve4,hostname);
    console.log("addresses: ",JSON.stringify(addresses));
    for (var i = 0; i < addresses.length; i++) {
        console.log(yield  wait.for(dns.reverse,addresses[i]));
    };

}

// -------------------
// RUN TESTS (Fiber)--
// -------------------
function* runTests(hostname){
    // test 1
    yield wait.runGenerator ( parallel_reverse ,hostname );
    // test 2
    yield wait.runGenerator ( sequential_reverse ,hostname);
}

// MAIN
try{
    wait.launchFiber(runTests,"google.com");
} 
catch(e){
    console.log("Error: " + e.message);
};


