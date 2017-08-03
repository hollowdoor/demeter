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

            /*if(/^#/.test(description)){
                const createDirective = (failed, result) =>{
                    result.failed = failed;
                    result.passed = !failed;
                    result.value = new Error('');
                    return result;
                };
                if(/^#[ ]TODO/.test(t.description)){
                    t = createDirective(true, t);
                }else if(/^#[ ]PASS/.test(t.description)){
                    t = createDirective(false, t);
                }
            }*/



            let message = description.length ? description : '';
            let str = '';
            if(passed){
                str = 'ok ' + count + ' - ' + message;
                /*if(value && value.message){
                    if(/#[ ]rethrow[ ]test/.test(value.message)){
                        str += indent(value.message, 2);
                    }
                }*/
            }else if(failed){
                //console.log('subTest ',subTest)
                if(subTest){
                    console.log(subTest);
                    let errMessage = '\n\n  ' + subTest.description + '\n';
                    errMessage += subTest.value.message
                    return 'not ok ' + count + ' - ' + message + ' ' +  indent(errMessage);
                }
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
