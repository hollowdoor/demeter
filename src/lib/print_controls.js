import writeVersion from './write_version.js';
import indent from 'indent-string';

export default class PrintControls {
    constructor({
        description = '',
        passed = true,
        failed = true,
        value = '',
        count,
        plan = 1,
        subTest = null
    } = {}){

        Object.defineProperties(this, {
            description: {value: description},
            passed: {value: passed},
            failed: {value: failed},
            value: {value},
            count: {value:count}
        });

        this.tap = function(){

            if(count === 1){
                console.log('TAP version 13');
                console.log('1..'+plan);
            }

            let message = description.length ? description : '';
            let str = '';
            if(passed){
                str = 'ok ' + count + ' - ' + message;
            }else if(failed){
                let errMessage = value ? value.message : '';
                str = 'not ok ' + count + ' - ' + message + ' ' + errMessage;
            }

            if(count === plan){
                setTimeout(()=>{
                    console.log('# done');
                });
            }
            return str;
        };
    }
}
