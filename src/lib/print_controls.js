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
            count,
            tracker
        });

        Object.defineProperty(this, 'plan', {
            get(){
                return tracker.plan
            }
        });
    }
    tap(){
        let buffer = [];
        if(this.count === 1){
            buffer.push('TAP version 13');
            buffer.push('1..'+this.plan);
        }

        let { description, value, count, tracker } = this;

        let message = description.length ? description : '';
        let str = '';
        if(this.passed){
            str = 'ok ' + count + ' - ' + message;
        }else if(this.failed){
            let errMessage = value ? value.message : '';
            str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
        }

        buffer.push(str);

        if(this.count === tracker.plan){
            buffer.push('# duration '+(Date.now()-tracker.startTime) + ' ms');
            let end = '';
            if(tracker.passed)
                end += '# passed '+tracker.passed;
            if(tracker.failed)
                end += ' failed '+tracker.failed;
            if(end.length){
                buffer.push(end);
            }
        }
        return buffer;
    }
}
