import RunControls from './run_controls.js';
import PrintControls from './print_controls.js';
import def from './def.js';

export default class Test {
    constructor({
        description = '',
        run = null,
        print = null
    } = {}){

        def(this, {
            description
        });

        Object.defineProperty(this, 'runTest', {
            value: function(tracker){

                let running = new RunControls(tracker, {
                    description,
                    count: tracker.count
                });

                return Promise.resolve(run(running))
                .then(result=>{
                    return print(new PrintControls(tracker, result));
                });
            }
        });
    }
}
