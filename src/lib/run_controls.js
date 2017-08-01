import Assertions from './assertions.js';

export default class RunControls {
    constructor({
        description = '',
        count = 0,
        plan = 1,
        time
    } = {}){

        Object.defineProperties(this, {
            count: {value: count}
        });

        this.getResult = function(value, passed){

            return {
                description,
                passed: !!passed,
                failed: !passed,
                value,
                count,
                plan
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

            /*if(typeof value === 'object'){
                let run = value['resolve'];
                if(typeof run === 'function'){
                    return value
                    .resolve()
                    .then(sub=>{
                        //console.log('sub ',sub)
                        if(sub.failed){
                            let result = this.fail();
                            result.subTest = sub;
                            return result;
                        }
                        return this.pass();
                    });
                }
            }*/

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
