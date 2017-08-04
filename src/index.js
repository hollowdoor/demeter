import getTestArgs from './lib/get_test_args.js';
import Test from './lib/test.js';
import FastReducableQueue from './lib/fast_reducable_queue.js';

export class Demeter {
    constructor(){
        let self = this,
            queue = this.queue = new FastReducableQueue();

        this.count = 0;
        this.passed = 0;
        this.failed = 0;
        //this.complete = false;
        Object.defineProperty(this, 'complete', {
            get(){
                return self.count === self.plan;
            }
        });
        Object.defineProperty(this, 'plan', {
            get(){
                return queue.length;
            }
        });
    }
    run(){

        this.startTime = Date.now();

        let pending = this.queue.reduce((p, t)=>{
            return p.then(v=>{
                ++this.count;
                t.run(this);
            });
        }, Promise.resolve());

        return pending;
    }
    take(...holders){

        for(let j=0; j<holders.length; j++){
            let queue = holders[j].queue;
            let i = 0;
            while(i < queue.length){
                this.queue.push(queue[i]);
                ++i;
            }
            holders[j].queue = null;
        }

        return this;
    }
    test(description, callback){

        if(typeof callback === 'undefined'){
            callback = description;
            description = '';
        }

        let test = new Test(this, {
            description,
            startTime: this.startTime,
            print(complete){
                let output = complete.tap();
                console.log(output);
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

        let test = new Test(this, {
            description,
            startTime: this.startTime,
            print(complete){
                let output = complete.tap();
                console.log(output);
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
