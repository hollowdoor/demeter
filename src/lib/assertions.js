import deepEqual from 'deep-equal';
import * as m from './messages.js';

function createAssertError(info = {}, passed=true){
    let assertData = Object.keys(info).reduce((data, prop)=>{
        return data + '  ' + prop + ': ' + info[prop] + '\n';
    }, '');

    let message = '\n\n  ---\n' + assertData + '  ...\n';

    let e = new Error(message);

    e.passed = !!passed;
    e.failed = !passed;

    return e;
}

function isEqual(a, b, strict=true){
    if(strict){
        return a === b;
    }
    return a == b;
}

export default class Assertions {
    constructor(running){
        this.running = running;
    }
    ok(val, message){

        if(!val){
            let err = createAssertError({
                message: m.showFalse(message, val),
                operator: 'ok',
                expected: true,
                actual: val
            }, false);

            throw err;
        }
    }
    assert(val, message){

        if(!val){
            let err = createAssertError({
                message: m.showFalse(message, val),
                operator: 'assert',
                expected: true,
                actual: val
            }, false);

            throw err;
        }
    }
    not(val, message){
        if(!!val){
            let err = createAssertError({
                message: m.showTrue(message, val),
                operator: 'not',
                expected: false,
                actual: val
            }, false);

            throw err;
        }
    }
    fail(message){
        let err = createAssertError({
            operator: 'fail',
        }, false);
        throw err;
    }
    equal(value1, value2, message){
        if(!isEqual(value1, value2, true)){
            let err = createAssertError({
                message: m.showNotEqual(message, value1, value2),
                operator: 'equal',
                expected: m.showEqual(null, value1, value2),
                actual: m.showNotEqual(null, value1, value2)
            }, false);

            throw err;
        }
    }
    equalish(value1, value2, message){
        if(!isEqual(value1, value2, false)){
            let err = createAssertError({
                message: m.showNotEqual(message, value1, value2),
                operator: 'equalish',
                expected: m.showEqual(null, value1, value2),
                actual: m.showNotEqual(null, value1, value2)
            }, false);

            throw err;
        }
    }
    notEqual(value1, value2, message){
        if(isEqual(value1, value2, true)){
            let err = createAssertError(message, {
                message: m.showEqual(message, value1, value2),
                operator: 'notEqual',
                expected: m.showNotEqual(null, value1, value2),
                actual: m.showEqual(null, value1, value2)
            }, false);

            throw err;
        }
    }
    notEqualish(value1, value2, message){
        if(isEqual(value1, value2, false)){
            let err = createAssertError(message, {
                message: m.showEqual(message, value1, value2),
                operator: 'notEqualish',
                expected: m.showNotEqual(null, value1, value2),
                actual: m.showEqual(null, value1, value2)
            }, false);

            throw err;
        }
    }
    reject(message=''){
        let err = createAssertError({
            message: message,
            operator: 'reject',
            expected: 'reject to not be called',
            actual: 'reject was called'
        }, false);
        return Promise.reject(err);
    }
    deepEqual(object1, object2, message){
        if(!deepEqual(object1, object2, {strict:true})){
            let err = createAssertError({
                message: m.showNotEqual(message, object1, object2),
                operator: 'deepEqual',
                expected: m.showEqual(null, object1, object2),
                actual: m.showNotEqual(null, object1, object2)
            }, false);

            throw err;
        }
    }
    deepEqualish(object1, object2, message){
        if(!deepEqual(object1, object2, {strict:false})){
            let err = createAssertError({
                message: m.showNotEqual(message, object1, object2),
                operator: 'deepEqualish',
                expected: m.showEqual(null, object1, object2),
                actual: m.showNotEqual(null, object1, object2)
            }, false);

            throw err;
        }
    }
}
