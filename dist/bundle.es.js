import deepEqual from 'deep-equal';

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
Assertions.prototype.equal = function equal (value1, value2, message){
    if(!isEqual(value1, value2, true)){
        var err = createAssertError({
            message: showNotEqual(message, value1, value2),
            operator: 'equal',
            expected: showEqual(null, value1, value2),
            actual: showNotEqual(null, value1, value2)
        }, false);

        throw err;
    }
};
Assertions.prototype.equalish = function equalish (value1, value2, message){
    if(!isEqual(value1, value2, false)){
        var err = createAssertError({
            message: showNotEqual(message, value1, value2),
            operator: 'equalish',
            expected: showEqual(null, value1, value2),
            actual: showNotEqual(null, value1, value2)
        }, false);

        throw err;
    }
};
Assertions.prototype.notEqual = function notEqual (value1, value2, message){
    if(isEqual(value1, value2, true)){
        var err = createAssertError(message, {
            message: showEqual(message, value1, value2),
            operator: 'notEqual',
            expected: showNotEqual(null, value1, value2),
            actual: showEqual(null, value1, value2)
        }, false);

        throw err;
    }
};
Assertions.prototype.notEqualish = function notEqualish (value1, value2, message){
    if(isEqual(value1, value2, false)){
        var err = createAssertError(message, {
            message: showEqual(message, value1, value2),
            operator: 'notEqualish',
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
Assertions.prototype.deepEqual = function deepEqual$1 (object1, object2, message){
    if(!deepEqual(object1, object2, {strict:true})){
        var err = createAssertError({
            message: showNotEqual(message, object1, object2),
            operator: 'deepEqual',
            expected: showEqual(null, object1, object2),
            actual: showNotEqual(null, object1, object2)
        }, false);

        throw err;
    }
};
Assertions.prototype.deepEqualish = function deepEqualish (object1, object2, message){
    if(!deepEqual(object1, object2, {strict:false})){
        var err = createAssertError({
            message: showNotEqual(message, object1, object2),
            operator: 'deepEqualish',
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
        count: {value: count},
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
        count: count,
        tracker: tracker
    });

    Object.defineProperty(this, 'plan', {
        get: function get(){
            return tracker.plan
        }
    });
};
PrintControls.prototype.tap = function tap (){
    var buffer = [];
    if(this.count === 1){
        buffer.push('TAP version 13');
        buffer.push('1..'+this.plan);
    }

    var ref = this;
        var description = ref.description;
        var value = ref.value;
        var count = ref.count;
        var tracker = ref.tracker;

    var message = description.length ? description : '';
    var str = '';
    if(this.passed){
        str = 'ok ' + count + ' - ' + message;
    }else if(this.failed){
        var errMessage = value ? value.message : '';
        str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
    }

    buffer.push(str);

    if(this.count === tracker.plan){
        buffer.push('# duration '+(Date.now()-tracker.startTime) + ' ms');
        var end = '';
        if(tracker.passed)
            { end += '# passed '+tracker.passed; }
        if(tracker.failed)
            { end += ' failed '+tracker.failed; }
        if(end.length){
            buffer.push(end);
        }
    }
    return buffer;
};

var Test = function Test(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var run = ref.run; if ( run === void 0 ) run = null;
    var print = ref.print; if ( print === void 0 ) print = null;


    def(this, {
        description: description
    });

    Object.defineProperty(this, 'runTest', {
        value: function(tracker){

            var running = new RunControls(tracker, {
                description: description,
                count: tracker.count
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
FastReducableQueue.prototype.take = function take (queue){
        var this$1 = this;

    for(var i=0, len=queue.length; i<len; i++){
        this$1.push(queue[i]);
    }
    queue.clear();
};
FastReducableQueue.prototype.push = function push (){
        var this$1 = this;
        var values = [], len$1 = arguments.length;
        while ( len$1-- ) values[ len$1 ] = arguments[ len$1 ];


    for(var i=0, len=values.length; i<len; i++){
        this$1[this$1.length] = values[i];
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

    var i = -1, len = this.length;
    while(++i < len){
        try{
            delete this$1[i];
        }catch(e){}
    }
    this.length = 0;
};

var Demeter = function Demeter(){
    var self = this;
    this.queue = new FastReducableQueue();

    this.count = 0;
    this.passed = 0;
    this.failed = 0;

    Object.defineProperty(this, 'complete', {
        get: function get(){
            return self.count === self.plan;
        }
    });

    Object.defineProperty(this, 'plan', {
        get: function get(){
            return self.queue.length;
        }
    });
};
Demeter.prototype.run = function run (){
        var this$1 = this;


    this.startTime = Date.now();

    var pending = this.queue.reduce(function (p, t){
        return p.then(function (v){
            ++this$1.count;
            return t.runTest(this$1);
        });
    }, Promise.resolve());

    return pending;
};
Demeter.prototype.take = function take (){
        var this$1 = this;
        var holders = [], len = arguments.length;
        while ( len-- ) holders[ len ] = arguments[ len ];


    holders.forEach(function (h){
        this$1.queue.take(h.queue);
    });

    return this;
};
Demeter.prototype.test = function test (description, callback){

    if(typeof callback === 'undefined'){
        callback = description;
        description = '';
    }

    var test = new Test({
        description: description,
        print: function print(complete){
            complete.tap().forEach(function (str){
                console.log(str);
            });
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

    var test = new Test({
        description: description,
        print: function print(complete){
            complete.tap().forEach(function (str){
                console.log(str);
            });
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

export { Demeter, test };
//# sourceMappingURL=bundle.es.js.map
