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

        /*Object.defineProperty(this, 'startTime', {
            get(){
                return tracker.startTime
            }
        });*/

        Object.defineProperty(this, 'plan', {
            get(){
                return tracker.plan
            }
        });

        /*this.tap = function(){

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
                    let end = '';
                    if(tracker.passed)
                        end += '# passed '+tracker.passed;
                    if(tracker.failed)
                        end += ' failed '+tracker.failed;
                    if(end.length){
                        console.log(end);
                    }
                });
            }
            return str;
        };*/
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
        //console.log('----------count', this.count);
        //console.log('----------plan ', tracker.plan);
        //console.log('----------tracker.queue.length',tracker.queue.length)

        if(this.count === tracker.plan){
            //let tracker = this.tracker;
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
