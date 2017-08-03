import RunControls from './run_controls.js';
import PrintControls from './print_controls.js';

export default class Test {
    constructor({
        description = '',
        run = null,
        print = null,
        time = null,
        plan = 1
    } = {}){

        Object.defineProperties(this, {
            description: {value: description},
            time: {value: time || Date.now()}
        });

        Object.defineProperty(this, 'resolve', {
            value: function({
                count = 1,
                plan
            } = {}){
                let running = new RunControls({
                    description,
                    count,
                    plan
                });

                return Promise.resolve(run(running))
            }
        });

        Object.defineProperty(this, 'run', {
            value: function({
                count = 1,
                plan
            } = {}){

                return this.resolve({count, plan})
                .then(result=>{
                    return print(new PrintControls(result));
                });

                /*let running = new RunControls({
                    description,
                    count,
                    plan
                });

                return Promise.resolve(run(running))
                .then(result=>{
                    return print(new PrintControls(result));
                });*/
            }
        });
    }
}
