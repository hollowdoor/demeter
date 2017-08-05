import getTestArgs from './lib/get_test_args.js';
import Test from './lib/test.js';
import FastReducableQueue from './lib/fast_reducable_queue.js';

export class Demeter {
    constructor(){
        let self = this;
        this.queue = new FastReducableQueue();

        this.count = 0;
        this.passed = 0;
        this.failed = 0;

        Object.defineProperty(this, 'complete', {
            get(){
                return self.count === self.plan;
            }
        });

        Object.defineProperty(this, 'plan', {
            get(){
                return self.queue.length;
            }
        });
    }
    run(){

        this.startTime = Date.now();

        let pending = this.queue.reduce((p, t)=>{
            return p.then(v=>{
                ++this.count;
                return t.runTest(this);
            });
        }, Promise.resolve());

        return pending;
    }
    take(...holders){

        holders.forEach(h=>{
            this.queue.take(h.queue);
        });

        return this;
    }
    test(description, callback){

        if(typeof callback === 'undefined'){
            callback = description;
            description = '';
        }

        let test = new Test({
            description,
            print(complete){
                complete.tap().forEach(str=>{
                    console.log(str);
                });
            },
            run(controls){
                return controls.resolve(callback);
            }
        });

        this.queue.push(test);
        return this;
    }
    reverse(description, callback){

        if(typeof callback === 'undefined'){
            callback = description;
            description = '';
        }

        let test = new Test({
            description,
            print(complete){
                complete.tap().forEach(str=>{
                    console.log(str);
                });
            },
            run(controls){
                return controls.reverse(callback);
            }
        });

        this.queue.push(test);
        return this;
    }
}

export function test(options = {}){
    return new Demeter(options);
}
