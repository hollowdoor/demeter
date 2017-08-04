(function (exports) {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var keys = createCommonjsModule(function (module, exports) {
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) { keys.push(key); }
  return keys;
}
});

var is_arguments = createCommonjsModule(function (module, exports) {
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
}
});

var index = createCommonjsModule(function (module) {
var pSlice = Array.prototype.slice;



var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) { opts = {}; }
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') { return false; }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') { return false; }
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    { return false; }
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (is_arguments(a)) {
    if (!is_arguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }
  try {
    var ka = keys(a),
        kb = keys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    { return false; }
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      { return false; }
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }
  return typeof a === typeof b;
}
});

var str = function (a) { return (
    typeof a === 'object'
    ? JSON.stringify(a, null, 2)
    : a
); };

var m = function (fn) { return function (message) {
    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    return (
    message
    ? message
    : fn.apply(void 0, values.map(function (v){ return str(v); }))
);
 }    };

var showEqual = m(function (a, b) { return a + ' equal to ' + b; });
var showNotEqual = m(function (a, b) { return a + ' not equal to ' + b; });
var showTrue = m(function (a) { return a + ' is truthy'; });
var showFalse = m(function (a) { return a + ' is falsy'; });

function createAssertError(info, passed){
    if ( info === void 0 ) info = {};
    if ( passed === void 0 ) passed=true;

    var assertData = Object.keys(info).reduce(function (data, prop){
        return data + '  ' + prop + ': ' + info[prop] + '\n';
    }, '');

    var message = '\n\n  ---\n' + assertData + '  ...\n';

    var e = new Error(message);

    e.passed = !!passed;
    e.failed = !passed;

    return e;
}

function isEqual(a, b, strict){
    if ( strict === void 0 ) strict=true;

    if(strict){
        return a === b;
    }
    return a == b;
}

var Assertions = function Assertions(running){
    this.running = running;
};
Assertions.prototype.ok = function ok (val, message){

    if(!val){
        var err = createAssertError({
            message: showFalse(message, val),
            operator: 'ok',
            expected: true,
            actual: val
        }, false);

        throw err;
    }
};
Assertions.prototype.assert = function assert (val, message){

    if(!val){
        var err = createAssertError({
            message: showFalse(message, val),
            operator: 'assert',
            expected: true,
            actual: val
        }, false);

        throw err;
    }
};
Assertions.prototype.not = function not (val, message){
    if(!!val){
        var err = createAssertError({
            message: showTrue(message, val),
            operator: 'not',
            expected: false,
            actual: val
        }, false);

        throw err;
    }
};
Assertions.prototype.fail = function fail (message){
    var err = createAssertError({
        operator: 'fail',
    }, false);
    throw err;
};
Assertions.prototype.equal = function equal (value1, value2, message, strict){
    if(!isEqual(value1, value2, strict)){
    //if(value1 !== value2){
        var err = createAssertError({
            message: showNotEqual(message, value1, value2),
            operator: 'equal',
            expected: showEqual(null, value1, value2),
            actual: showNotEqual(null, value1, value2)
        }, false);

        throw err;
    }
};
Assertions.prototype.notEqual = function notEqual (value1, value2, message, strict){
    if(isEqual(value1, value2, strict)){
    //if(value1 === value2){
        var err = createAssertError(message, {
            message: showEqual(message, value1, value2),
            operator: 'notEqual',
            expected: showNotEqual(null, value1, value2),
            actual: showEqual(null, value1, value2)
        }, false);

        throw err;
    }
};
Assertions.prototype.reject = function reject (message){
        if ( message === void 0 ) message='';

    var err = createAssertError({
        message: message,
        operator: 'reject',
        expected: 'reject to not be called',
        actual: 'reject was called'
    }, false);
    return Promise.reject(err);
};
Assertions.prototype.deepEqual = function deepEqual$1 (object1, object2, message, strict){
        if ( strict === void 0 ) strict = true;

    if(!index(object1, object2, {strict: strict})){
        var err = createAssertError({
            message: showNotEqual(message, object1, object2),
            operator: 'deepEqual',
            expected: showEqual(null, object1, object2),
            actual: showNotEqual(null, object1, object2)
        }, false);

        throw err;
    }
};

var RunControls = function RunControls(tracker, ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var count = ref.count; if ( count === void 0 ) count = 0;
    var plan = ref.plan; if ( plan === void 0 ) plan = 1;


    Object.defineProperties(this, {
        count: {value: count}
    });

    this.getResult = function(value, passed){
        if(!!passed){
            ++tracker.passed;
        }else{
            ++tracker.failed;
        }
            
        return {
            description: description,
            passed: !!passed,
            failed: !passed,
            value: value,
            count: count
        };
    };
};
RunControls.prototype.pass = function pass (value){
    return this.getResult(value, true);
};
RunControls.prototype.fail = function fail (value){
    return this.getResult(value, false);
};
RunControls.prototype.asserts = function asserts (){
    return new Assertions(this);
};
RunControls.prototype.resolve = function resolve (callback, reverse){
        var this$1 = this;
        if ( reverse === void 0 ) reverse = false;

    try{
        var value = callback(this.asserts());

        if(reverse){
            return Promise.resolve(value)
            .then(function (v){ return this$1.fail(v); })
            .catch(function (e){ return this$1.pass(e); });
        }

        return Promise.resolve(value)
        .then(function (v){ return this$1.pass(v); })
        .catch(function (e){ return this$1.fail(e); });
    }catch(e){
        if(reverse){ return Promise.resolve(this.pass(e)); }
        return Promise.resolve(this.fail(e));
    }
};
RunControls.prototype.reverse = function reverse (callback){
    return this.resolve(callback, true);
};

var writeVersion = (function (){
    var g;
    var TAP_VERSION_WRITTEN = false;
    if(typeof global === 'undefined'){
        g = window;
    }else{
        g = global;
    }

    if(typeof g['TAP_VERSION_WRITTEN'] === 'undefined'){
        Object.defineProperty(g, 'TAP_VERSION_WRITTEN', {
            get: function get(){
                return TAP_VERSION_WRITTEN;
            }
        });
    }

    return function (){
        if(g.TAP_VERSION_WRITTEN) { return; }
        console.log('TAP version 13');
        TAP_VERSION_WRITTEN = true;
    };
})();

function def(self, src){
    for(var n in src){
        if(src.hasOwnProperty(n)){
            Object.defineProperty(self, n, {
                value: src[n],
                enumerable: true
            });
        }
    }

    return self;
}

var PrintControls = function PrintControls(tracker, ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var passed = ref.passed; if ( passed === void 0 ) passed = true;
    var failed = ref.failed; if ( failed === void 0 ) failed = true;
    var value = ref.value; if ( value === void 0 ) value = '';
    var count = ref.count;


    def(this, {
        description: description,
        passed: passed,
        failed: failed,
        value: value,
        count: count
    });

    Object.defineProperty(this, 'startTime', {
        get: function get(){
            return tracker.startTime
        }
    });

    Object.defineProperty(this, 'plan', {
        get: function get(){
            return tracker.plan
        }
    });

    this.tap = function(){
        var this$1 = this;


        if(count === 1){
            console.log('TAP version 13');
            console.log('1..'+this.plan);
        }

        var message = description.length ? description : '';
        var str = '';
        if(passed){
            str = 'ok ' + count + ' - ' + message;
        }else if(failed){
            var errMessage = value ? value.message : '';
            str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
        }

        if(count === tracker.plan){

            setTimeout(function (){
                if(!tracker.startTime) { return; }
                console.log('# duration '+(Date.now()-this$1.startTime) + ' ms');
                if(tracker.passed)
                    { console.log('# passed '+tracker.passed); }
                if(tracker.failed)
                    { console.log('# failed '+tracker.failed); }
            });
        }
        return str;
    };
};

var Test = function Test(tracker, ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var run = ref.run; if ( run === void 0 ) run = null;
    var print = ref.print; if ( print === void 0 ) print = null;


    def(this, {
        description: description
    });

    Object.defineProperty(this, 'run', {
        value: function(ref){
            if ( ref === void 0 ) ref = {};
            var count = ref.count; if ( count === void 0 ) count = 1;
            var plan = ref.plan; if ( plan === void 0 ) plan = 1;


            Object.defineProperty(this, 'plan', {
                value: plan
            });

            var running = new RunControls(tracker, {
                description: description,
                count: count,
                plan: plan
            });

            return Promise.resolve(run(running))
            .then(function (result){
                return print(new PrintControls(tracker, result));
            });
        }
    });
};

var FastReducableQueue = function FastReducableQueue(){
    this.length = 0;
};
FastReducableQueue.prototype.take = function take (){
        var this$1 = this;
        var queues = [], len = arguments.length;
        while ( len-- ) queues[ len ] = arguments[ len ];

    for(var j=0; j<queues.length; j++){
        for(var i=0; i<queues[j].length; i++){
            this$1.push(queues[j][i]);
        }
        queues[j].clear();
    }
};
FastReducableQueue.prototype.push = function push (){
        var this$1 = this;
        var values = [], len = arguments.length;
        while ( len-- ) values[ len ] = arguments[ len ];

    if(this.length === 0){
        for(var i=0; i<50; i++){ this$1[i] = {}; }
    }

    for(var i$1=0; i$1<values.length; i$1++){
        this$1[this$1.length] = values[i$1];
        ++this$1.length;
    }
};
FastReducableQueue.prototype.shift = function shift (){
        var this$1 = this;

    var v = this[0], i = 0;
    --this.length;
    while(i < this.length){
        this$1[i] = this$1[i+1];
    }

    return v;
};
FastReducableQueue.prototype.reduce = function reduce (fn, startValue){
        var this$1 = this;

    var i = 0;
    var result = startValue;
    //console.log('this.length ', this.length)
    while(i < this.length){
        result = fn(result, this$1[i], i, this$1);
        ++i;
    }
    return result;
};
FastReducableQueue.prototype.clear = function clear (){
        var this$1 = this;

    var i = 0;
    while(i < this.length){
        try{
            delete this$1[i];
        }catch(e){}
    }
    this.length = 0;
};

var Demeter = function Demeter(){
    var self = this,
        queue = this.queue = new FastReducableQueue();

    this.count = 0;
    this.passed = 0;
    this.failed = 0;
    //this.complete = false;
    Object.defineProperty(this, 'complete', {
        get: function get(){
            return self.count === self.plan;
        }
    });
    Object.defineProperty(this, 'plan', {
        get: function get(){
            return queue.length;
        }
    });
};
Demeter.prototype.run = function run (){
        var this$1 = this;


    this.startTime = Date.now();

    var pending = this.queue.reduce(function (p, t){
        return p.then(function (v){
            ++this$1.count;
            t.run(this$1);
        });
    }, Promise.resolve());

    return pending;
};
Demeter.prototype.take = function take (){
        var this$1 = this;
        var holders = [], len = arguments.length;
        while ( len-- ) holders[ len ] = arguments[ len ];


    for(var j=0; j<holders.length; j++){
        var queue = holders[j].queue;
        var i = 0;
        while(i < queue.length){
            this$1.queue.push(queue[i]);
            ++i;
        }
        holders[j].queue = null;
    }

    return this;
};
Demeter.prototype.test = function test (description, callback){

    if(typeof callback === 'undefined'){
        callback = description;
        description = '';
    }

    var test = new Test(this, {
        description: description,
        startTime: this.startTime,
        print: function print(complete){
            var output = complete.tap();
            console.log(output);
        },
        run: function run(controls){
            return controls.resolve(callback);
        }
    });

    this.queue.push(test);
    return this;
};
Demeter.prototype.reverse = function reverse (description, callback){

    if(typeof callback === 'undefined'){
        callback = description;
        description = '';
    }

    var test = new Test(this, {
        description: description,
        startTime: this.startTime,
        print: function print(complete){
            var output = complete.tap();
            console.log(output);
        },
        run: function run(controls){
            return controls.reverse(callback);
        }
    });

    this.queue.push(test);
    return this;
};

function test(options){
    if ( options === void 0 ) options = {};

    return new Demeter(options);
}

exports.Demeter = Demeter;
exports.test = test;

}((this.demeter = this.demeter || {})));
//# sourceMappingURL=demeter.js.map
