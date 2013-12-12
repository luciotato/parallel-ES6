/* parallel-ES6 - based on ES6-harmony generators 
 - Sequential programming for node.js - end of callback hell
 - Copyright 2013 Lucio Tato

 -- WARNING: bleeding edge --
 This lib is based on ECMAScript 6, 
 the next version of the javascript standard, code-named "Harmony".
 (release target date December 2013).

 This lib also uses bleeding edge v8 Harmony features, so you’ll need to
 use the latest -unstable- nodejs version wich today is v0.11.6 
 and also pass the --harmony flag when executing node.

    node --harmony parallel-demo.js

 check the complementing lib wait.for-ES6 at http://github.com/luciotato/waitfor-ES6
*/
"use strict";

var wait = require('wait.for-es6');

var Parallel = {

    // -------------
    // parallel.map
    // -------------
    // generatorFn will be run for each item
    // when all the generators complete, finalCallback will be called
    //
    // parallel.map can be waited.for, as in: 
    // mappedArr = yield wait.for(parallel.map, arr, translateFn);
    //
    map : function(arr, fiberFn, finalCallback){
        //
        // fiberFn = function*(item,index,arr) -> returns item mapped
        //
        console.log(typeof fiberFn);
        var mapResult={arr:[],count:0,expected:arr.length};
        if (mapResult.expected===0) return finalCallback(null,mapResult.arr); //early exit

        var taskJoiner=function(inx,data,mapResult){
            //console.log('result arrived',inx,data);
            mapResult.arr[inx]=data;
            mapResult.count++;
            if (mapResult.count>=mapResult.expected) { // all results arrived
                finalCallback(null,mapResult.arr) ; // final callback OK
            }
        };

        //main
        for (var i = 0; i < mapResult.expected; i++) {
            var itemIterator = wait.launchFiber( "onComplete"
                    //as final callback, create a closure to contain the index and store result data
                    ,function(err,data){ 
                        if (err) return finalCallback(err,data); //err
                        taskJoiner(data.iterator.index ,data.result, mapResult); 
                    }
                    ,fiberFn, arr[i],i,arr
            );
            itemIterator.index = i; //store index in the interator itself
        };

    }

    // ----------------------
    // parallel filter
    // ----------------------
    ,filter : function(arr, filterGeneratorFn, finalCallback){
        //
        // filterGeneratorFn = function*(item,index,arr) -> returns true/false
        //
        // usage:
        //
        // parallel.filter(myArr, filterFn,
        //       function(err,data){
        //               console.log('process ended, filtered result arr:', data)
        //       });
        //
        // parallel.filter can be waited with wait.for, as in:
        //
        // filteredArr = yield wait.for(parallel.filter,arr,filterFn);
        //
        // main: parallel call filterGeneratorFn on each item, store result (true/false)
        Parallel.map( arr, filterGeneratorFn
                ,function(err,testResults){ //when all the filters finish
                    if (err) return finalCallback(err);
                    // create an array for each item where filterGeneratorFn returned true
                    var filteredArr=[];
                    for (var i = 0; i < arr.length; i++) {
                        if (testResults[i]) filteredArr.push(arr[i]);
                    };
                    finalCallback(null,filteredArr);
                });
    }

};

module.exports = Parallel; //export

