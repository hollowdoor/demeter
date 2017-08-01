(function (exports) {
'use strict';

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
                    return Promise.reject(
                        new Error(
                            '# rethrow test \n'+v.value.message.split('\n').join('\n  ')+'\n'
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
RunControls.prototype.toPromise = function toPromise (value){
    try{

        return value;
    }catch(e){
        return Promise.reject(e);
    }
};
RunControls.prototype.resolve = function resolve (callback, reverse){
        var this$1 = this;
        if ( reverse === void 0 ) reverse = false;

    try{
        var value = callback(this.asserts());
        if(typeof value === 'object'){
            var run = value['run'];
            if(typeof run === 'function'){
                value = value.run(null, {rethrow: true});
            }
        }

        if(reverse){
            return Promise.resolve(value)
            .then(function (v){ return this$1.fail(v); })
            .catch(function (e){ return this$1.pass(e); });
        }

        return Promise.resolve(value)
        .then(function (v){ return this$1.pass(v); })
        .catch(function (e){ return this$1.fail(e); });
    }catch(e){
        if(reverse){ return this.pass(e); }
        return this.fail(e);
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

var index = function (str, count, opts) {
	// Support older versions: use the third parameter as options.indent
	// TODO: Remove the workaround in the next major version
	var options = typeof opts === 'object' ? Object.assign({indent: ' '}, opts) : {indent: opts || ' '};
	count = count === undefined ? 1 : count;

	if (typeof str !== 'string') {
		throw new TypeError(("Expected `input` to be a `string`, got `" + (typeof str) + "`"));
	}

	if (typeof count !== 'number') {
		throw new TypeError(("Expected `count` to be a `number`, got `" + (typeof count) + "`"));
	}

	if (typeof options.indent !== 'string') {
		throw new TypeError(("Expected `options.indent` to be a `string`, got `" + (typeof options.indent) + "`"));
	}

	if (count === 0) {
		return str;
	}

	var regex = options.includeEmptyLines ? /^/mg : /^(?!\s*$)/mg;
	return str.replace(regex, options.indent.repeat(count));
};

var PrintControls = function PrintControls(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description;
    var result = ref.result; if ( result === void 0 ) result = {};
    var count = ref.count; if ( count === void 0 ) count = 0;
    var rethrow = ref.rethrow;


    Object.defineProperty(this, '_result', {
        value: result
    });
    Object.defineProperty(this, 'count', {
        value: count,
        enumerable: true
    });

    this.tap = function(){
        //writeVersion();
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
            if(t.value && t.value.message){
                if(/#[ ]rethrow[ ]test/.test(t.value.message)){
                    str += index(t.value.message, 2);
                }
            }
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

var index$2 = function () {
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

	var delaying = index$2();
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

var index$1 = generate(true);
var reject = generate(false);
var CancelError_1 = CancelError;

index$1.reject = reject;
index$1.CancelError = CancelError_1;

function timeout(n){
    return index$1(n);
}

var Test = function Test(ref){
    if ( ref === void 0 ) ref = {};
    var description = ref.description; if ( description === void 0 ) description = '';
    var run = ref.run; if ( run === void 0 ) run = null;
    var print = ref.print; if ( print === void 0 ) print = null;
    var time = ref.time; if ( time === void 0 ) time = null;
    var count = ref.count; if ( count === void 0 ) count = 0;
    var rethrow = ref.rethrow; if ( rethrow === void 0 ) rethrow = false;


    var pending = timeout(1);
    var included = [];
    this['@@testinstance'] = true;
    time = time || Date.now();

    Object.defineProperties(this, {
        count: {get: function get(){ return count; }},
        startTime: {value: time},
        rethrow: {value: rethrow}
    });



    Object.defineProperty(this, 'include', {
        value: function(){
            var plans = [], len = arguments.length;
            while ( len-- ) plans[ len ] = arguments[ len ];

            included = included.concat(plans);
        }
    });

    function resolve(callback, options){

        if(typeof options === 'undefined'){
            options = {};
            options.keepTesting = true;
            options.rethrow = false;
        }else if(typeof options === 'boolean'){
            var kt = options;
            options = {};
            options.keepTesting = kt;
            options.rethrow = false;
        }else if(typeof options === 'object'){
            //console.log('options -------------- ',options)
            if(typeof options.keepTesting === 'undefined'){
                options.keepTesting = true;
            }else{
                options.keepTesting = !!options.keepTesting;
            }

            options.rethrow = !!options.rethrow;
        }

        var running;
        var keepTesting = options.keepTesting;
        var rethrow = options.rethrow;

        if(run){

            running = new RunControls({
                description: description,
                rethrow: rethrow,
                read: function read(result){
                    return print(new PrintControls({
                        result: result,
                        count: count
                    }));
                }
            });

        }

        if(included.length){
            pending = included.reduce(function (p, plan){
                return p.then(function (v){ return plan.run(); });
            }, Promise.resolve());
        }

        if(run){
            pending = pending.then(function (v){ return run(running); });
            return pending
            .then(function (v){

                try{
                    if(callback){
                        return callback(v);
                    }
                    return value;
                }catch(e){
                    return Promise.reject(e);
                }

            }).then(function (v){

                if(!keepTesting && !rethrow){
                    console.log('1..' + count);
                    console.log('# duration ' + (Date.now()-time) + 'ms');
                }

                return v;
            });
        }

        if(callback){
            return Promise.resolve().then(callback);
        }

        return Promise.resolve();
    }

    Object.defineProperty(this, 'run', {
        value: resolve
    });

    /*Object.defineProperty(this, 'run', {
        value: function(callback, keepTesting){

            if(included.length){
                pending = included.reduce((p, plan)=>{
                    return p.then(v=>plan.done());
                }, Promise.resolve());
            }

            if(run){
                pending = pending.then(v=>run(running));
                return pending
                .then(v=>{
                    if(!keepTesting && !rethrow){
                        console.log('1..' + count);
                        console.log('# duration ' + (Date.now()-time) + 'ms');
                    }
                    try{
                        if(callback){
                            return callback(v);
                        }
                        return pending.then(a=>v);
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
    });*/
};

var ClueCatTest = (function (Test$$1) {
    function ClueCatTest(ref){
        if ( ref === void 0 ) ref = {};
        var description = ref.description; if ( description === void 0 ) description = '';
        var run = ref.run; if ( run === void 0 ) run = null;
        var print = ref.print; if ( print === void 0 ) print = null;
        var time = ref.time; if ( time === void 0 ) time = null;
        var count = ref.count; if ( count === void 0 ) count = 0;
        var rethrow = ref.rethrow; if ( rethrow === void 0 ) rethrow = false;


        Test$$1.call(this, {
            description: description,
            run: run,
            print: print,
            time: time,
            count: count,
            rethrow: rethrow
        });

    }

    if ( Test$$1 ) ClueCatTest.__proto__ = Test$$1;
    ClueCatTest.prototype = Object.create( Test$$1 && Test$$1.prototype );
    ClueCatTest.prototype.constructor = ClueCatTest;
    ClueCatTest.prototype.test = function test (description, options, callback){
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
                return self.run(function (){
                    var result = controls.resolve(callback);
                    return controls.write(result).end();
                }, true);
            }
        });
    };
    ClueCatTest.prototype.reverse = function reverse (description, options, callback){
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
                return self.run(function (){
                    var result = controls.reverse(callback);
                    return controls.write(result).end();
                }, true);
            }
        });
    };

    return ClueCatTest;
}(Test));

function test(options){
    if ( options === void 0 ) options = {};

    return new ClueCatTest(options);
}

exports.ClueCatTest = ClueCatTest;
exports.test = test;

}((this.clueCat = this.clueCat || {})));
//# sourceMappingURL=clue-cat.js.map
