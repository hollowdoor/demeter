import RunControls from './run_controls.js';
import PrintControls from './print_controls.js';
import def from './def.js';

export default class Test {
    constructor(tracker, {
        description = '',
        run = null,
        print = null
    } = {}){

        def(this, {
            description
        });

        Object.defineProperty(this, 'run', {
            value: function({
                count = 1,
                plan = 1
            } = {}){

                Object.defineProperty(this, 'plan', {
                    value: plan
                });

                let running = new RunControls(tracker, {
                    description,
                    count,
                    plan
                });

                return Promise.resolve(run(running))
                .then(result=>{
                    return print(new PrintControls(tracker, result));
                });
            }
        });
    }
}
