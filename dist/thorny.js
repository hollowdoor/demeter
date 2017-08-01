(function (exports) {
'use strict';

function createAssertError(message, info, passed){
    if ( info === void 0 ) info = {};
    if ( passed === void 0 ) passed=true;

    message = message ? '\n' + message : '';

    var assertData = Object.keys(info).reduce(function (data, prop){
        return data + '  ' + prop + ': ' + info[prop] + '\n';
    }, '');


    message += '\n  ---\n' + assertData + '  ...\n';


    var e = new Error(message);
    //console.log('PASSED ', passed);console.log(info);

    e.passed = !!passed;
    e.failed = !passed;
    //console.log('e ', e)
    return e;
}

var Assertions = function Assertions () {};

Assertions.prototype.assert = function assert (val, message, extra){
        if ( extra === void 0 ) extra = {};


    if(!val){
        var err = createAssertError(message, {
            operator: 'assert',
            expected: true,
            actual: val
        }, false);

        throw err;
    }
};
Assertions.prototype.fail = function fail (message){
    var err = createAssertError(message, {
        operator: 'fail',
    }, false);
    throw err;
};
Assertions.prototype.equal = function equal (value1, value2, message){
        if ( message === void 0 ) message='';

    if(value1 !== value2){
        var err = createAssertError(message, {
            operator: 'equal',
            expected: value1,
            actual: value2
        }, false);

        throw err;
    }
};
Assertions.prototype.reject = function reject (message){
        if ( message === void 0 ) message='';

    var err = createAssertError(message, {
        operator: 'reject'
    }, false);
    return Promise.reject(err);
};

var RunControls = function RunControls(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var count = ref.count; if ( count === void 0 ) count = 0;
    var read = ref.read; if ( read === void 0 ) read = null;
    var rethrow = ref.rethrow; if ( rethrow === void 0 ) rethrow = false;


    var pending = Promise.resolve();
    var rethrown = false;

    Object.defineProperties(this, {
        rethrow: {value: rethrow}
    });

    this.getResult = function(value, passed){

        return {
            description: description,
            passed: !!passed,
            failed: !passed,
            value: value
        };
    };


    this.write = function(result){
        if(rethrown){ return this; }
        if(rethrow){
            rethrown = true;
            pending = pending.then(function (v){ return result; }).then(function (v){
                if(v.value && v.value instanceof Error){
                    //let str = '\n\n  # rethrown test \n'+v.value.message.split('\n').join('\n  ')+'\n';
                    //let err = new Error(str);
                    return Promise.reject(
                        new Error(
                            '\n\n  # rethrown test \n'+v.value.message.split('\n').join('\n  ')+'\n'
                        )
                    );
                }
                return v;
            });
            return this;
        }

        pending = pending.then(function (v){ return result; }).then(function (result){
            return read(result);
        });

        return this;
    };


    this.end = function(){
        return pending;
    };
};
RunControls.prototype.pass = function pass (value){
    return this.getResult(value, true);
};
RunControls.prototype.fail = function fail (value){
    return this.getResult(value, false);
};
RunControls.prototype.asserts = function asserts (){
    return new Assertions();
};
RunControls.prototype.resolve = function resolve (callback){
        var this$1 = this;

    try{
        return Promise.resolve(callback(this.asserts()))
        .then(function (v){ return this$1.pass(v); })
        .catch(function (e){ return this$1.fail(e); });
    }catch(e){
        return this.fail(e);
    }
};
RunControls.prototype.reverse = function reverse (callback){
        var this$1 = this;

    try{
        return Promise.resolve(callback(this.asserts()))
        .then(function (v){ return this$1.fail(v); })
        .catch(function (e){ return this$1.pass(e); });
    }catch(e){
        return this.pass(e);
    }
};

var PrintControls = function PrintControls(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description;
    var result = ref.result; if ( result === void 0 ) result = {};
    var count = ref.count; if ( count === void 0 ) count = 0;

    Object.defineProperty(this, '_result', {
        value: result
    });
    Object.defineProperty(this, 'count', {
        value: count,
        enumerable: true
    });

    this.tap = function(){
        var t = this.result();

        if(/^#/.test(t.description)){
            var createDirective = function (failed, result) {
                result.failed = failed;
                result.passed = !failed;
                result.value = new Error('');
                return result;
            };
            if(/^#[ ]TODO/.test(t.description)){
                t = createDirective(true, t);
            }else if(/^#[ ]PASS/.test(t.description)){
                t = createDirective(false, t);
            }
        }

        var message = t.description.length ? t.description : '';
        var str = '';

        if(t.passed){
            str = 'ok ' + count + ' - ' + message;
        }else if(t.failed){
            var errMessage = t.value ? t.value.message : '';
            str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
        }
        return str;
    };
};
PrintControls.prototype.result = function result (){
    return this._result;
};

function getTestArgs(description, options, callback){
    if(typeof callback === 'undefined'){
        if(typeof options === 'undefined'){
            callback = description;
            options = {};
            description = '';
        }else{
            callback = options;
        }
    }
    return [description, options, callback];
}

var index$1 = function () {
	var ret = {};

	ret.promise = new Promise(function (resolve, reject) {
		ret.resolve = resolve;
		ret.reject = reject;
	});

	return ret;
};

var CancelError = (function (Error) {
	function CancelError(message) {
		Error.call(this, message);
		this.name = 'CancelError';
	}

	if ( Error ) CancelError.__proto__ = Error;
	CancelError.prototype = Object.create( Error && Error.prototype );
	CancelError.prototype.constructor = CancelError;

	return CancelError;
}(Error));

var generate = function (willResolve) { return function (ms, value) {
	ms = ms || 0;
	var useValue = (arguments.length > 1);
	var result = value;

	var delaying = index$1();
	var promise = delaying.promise;

	var timeout = setTimeout(function () {
		var settle = willResolve ? delaying.resolve : delaying.reject;
		settle(result);
	}, ms);

	var thunk = function (thunkResult) {
		if (!useValue) {
			result = thunkResult;
		}
		return promise;
	};

	thunk.then = promise.then.bind(promise);
	thunk.catch = promise.catch.bind(promise);
	thunk._actualPromise = promise;

	thunk.cancel = function () {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
			delaying.reject(new CancelError('Delay canceled'));
		}
	};

	return thunk;
}; };

var index = generate(true);
var reject = generate(false);
var CancelError_1 = CancelError;

index.reject = reject;
index.CancelError = CancelError_1;

function timeout(n){
    return index(n);
}

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

function run(pattern, options, args){

    if(typeof options === 'undefined'){
        options = {};
        args = [];
    }else if(typeof args === 'undefined'){
        if(Object.prototype.toString.call(options) === '[object Array]'){
            args = options;
            options = {};
        }else{
            args = [];
        }
    }

    options.env = Object.assign(options.env || {}, {
        TEST_ENVIRONMENT: true
    });

    try{

        var glob = require('glob-promise');
        var path = require('path');
        var cwd = process.cwd();
        //console.log('cwd ',cwd)
        //console.log('options ',options)
        return glob(pattern, options).then(function (files){
            //console.log('files ',files)
            return Promise.all(
                files.map(function (file){
                    return spawn(
                        [file].concat(args),
                        //[path.join(cwd, file)].concat(args),
                        options
                    );
                })
            );
        });

    }catch(e){
        return Promise.reject(e);
    }
}

function spawn(args, options){
    if ( args === void 0 ) args=[];
    if ( options === void 0 ) options = {};

    try{
        var tapMerge = require('tap-merge');
        var multistream = require('multistream');
        var spawnCP = require('child_process').spawn;

        var out = tapMerge();
        //out.pipe(process.stdout);

        options.stdio = [null, 'pipe', null];

        return new Promise(function (resolve, reject){
            var cp = spawnCP('node', args, options);
            cp.on('exit', resolve);
            cp.on('error', reject);
            //multistream([cp.stdout, cp.stderr]).pipe(out).pipe(process.stdout);
            cp.stdout.pipe(out).pipe(process.stdout);
            //cp.stderr.pipe(out).pipe(process.stderr);
        });
    }catch(e){
        return Promise.reject(e);
    }
}

var ThornyTest = function ThornyTest(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var run = ref.run; if ( run === void 0 ) run = null;
    var print = ref.print; if ( print === void 0 ) print = null;
    var time = ref.time; if ( time === void 0 ) time = null;
    var count = ref.count; if ( count === void 0 ) count = 0;
    var rethrow = ref.rethrow; if ( rethrow === void 0 ) rethrow = false;

    writeVersion();
    var pending = timeout(1);
    this['@@testinstance'] = true;
    time = time || Date.now();

    Object.defineProperties(this, {
        count: {get: function get(){ return count; }},
        startTime: {value: time},
        rethrow: {value: rethrow}
    });

    var running;

    if(run){

        running = new RunControls({
            description: description,
            rethrow: rethrow,
            read: function read(result){
                return print(new PrintControls({result: result, count: count}));
            }
        });

        //pending = pending.then(v=>run(running));

    }

    var included = [];

    Object.defineProperty(this, 'include', {
        value: function(){
            var plans = [], len = arguments.length;
            while ( len-- ) plans[ len ] = arguments[ len ];

            included = included.concat(plans);
        }
    });

    Object.defineProperty(this, 'done', {
        value: function(callback, keepTesting){

            if(included.length){
                pending = included.reduce(function (p, plan){
                    return p.then(function (v){ return plan.done(); });
                }, Promise.resolve());
            }

            if(run){
                pending = pending.then(function (v){ return run(running); });
                return pending
                .then(function (v){
                    if(!keepTesting && !rethrow){
                        console.log('1..' + count);
                        console.log('# duration ' + (Date.now()-time) + 'ms');
                    }
                    try{
                        if(callback){
                            return callback(v);
                        }
                        return pending.then(function (a){ return v; });
                    }catch(e){
                        return Promise.reject(e);
                    }

                });
            }

            if(callback){
                return Promise.resolve().then(callback);
            }

            return Promise.resolve();
        }
    });
};
ThornyTest.prototype.test = function test (description, options, callback){
    var self = this;

    var assign;
        (assign = getTestArgs(description, options, callback), description = assign[0], options = assign[1], callback = assign[2]);

    return new (this.constructor)({
        description: description,
        time: this.startTime,
        count: this.count + 1,
        rethrow: options.rethrow,
        print: function print(complete){
            var output = complete.tap();
            console.log(output);
        },
        run: function run(controls){
            return self.done(function (){
                var result = controls.resolve(callback);
                return controls.write(result).end();
            }, true);
        }
    });
};
ThornyTest.prototype.reverse = function reverse (description, options, callback){
    var self = this;

    var assign;
        (assign = getTestArgs(description, options, callback), description = assign[0], options = assign[1], callback = assign[2]);

    return new (this.constructor)({
        description: description,
        time: this.startTime,
        count: this.count + 1,
        rethrow: options.rethrow,
        print: function print(complete){
            var output = complete.tap();
            console.log(output);
        },
        run: function run(controls){
            return self.done(function (){
                var result = controls.reverse(callback);
                return controls.write(result).end();
            }, true);
        }
    });
};

function thorny(options){
    if ( options === void 0 ) options = {};

    return new ThornyTest(options);
}

exports.ThornyTest = ThornyTest;
exports.thorny = thorny;
exports.run = run;

}((this.thorny = this.thorny || {})));
//# sourceMappingURL=thorny.js.map
