import Assertions from './assertions.js';

export default class RunControls {
    constructor(tracker, {
        description = '',
        count = 0,
        plan = 1
    } = {}){

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
                description,
                passed: !!passed,
                failed: !passed,
                value,
                count
            };
        };
    }
    pass(value){
        return this.getResult(value, true);
    }
    fail(value){
        return this.getResult(value, false);
    }
    asserts(){
        return new Assertions(this);
    }
    resolve(callback, reverse = false){
        try{
            let value = callback(this.asserts());

            if(reverse){
                return Promise.resolve(value)
                .then(v=>this.fail(v))
                .catch(e=>this.pass(e));
            }

            return Promise.resolve(value)
            .then(v=>this.pass(v))
            .catch(e=>this.fail(e));
        }catch(e){
            if(reverse){ return Promise.resolve(this.pass(e)); }
            return Promise.resolve(this.fail(e));
        }
    }
    reverse(callback){
        return this.resolve(callback, true);
    }
}
