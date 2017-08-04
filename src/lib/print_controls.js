import writeVersion from './write_version.js';
import indent from 'indent-string';
import def from './def.js';

export default class PrintControls {
    constructor(tracker, {
        description = '',
        passed = true,
        failed = true,
        value = '',
        count
    } = {}){

        def(this, {
            description,
            passed,
            failed,
            value,
            count
        });

        Object.defineProperty(this, 'startTime', {
            get(){
                return tracker.startTime
            }
        });

        Object.defineProperty(this, 'plan', {
            get(){
                return tracker.plan
            }
        });

        this.tap = function(){

            if(count === 1){
                console.log('TAP version 13');
                console.log('1..'+this.plan);
            }

            let message = description.length ? description : '';
            let str = '';
            if(passed){
                str = 'ok ' + count + ' - ' + message;
            }else if(failed){
                let errMessage = value ? value.message : '';
                str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
            }

            if(count === tracker.plan){

                setTimeout(()=>{
                    if(!tracker.startTime) return;
                    console.log('# duration '+(Date.now()-this.startTime) + ' ms');
                    if(tracker.passed)
                        console.log('# passed '+tracker.passed);
                    if(tracker.failed)
                        console.log('# failed '+tracker.failed);
                });
            }
            return str;
        };
    }
}
