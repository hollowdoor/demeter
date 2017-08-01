export default function getTestArgs(description, options, callback){
    if(typeof callback === 'undefined'){
        if(typeof options === 'undefined'){
            callback = description;
            options = {};
            description = '';
        }else{
            callback = options;
        }
    }
    return [description, options, callback];
}
