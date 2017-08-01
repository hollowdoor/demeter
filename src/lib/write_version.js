const writeVersion = (()=>{
    let g;
    let TAP_VERSION_WRITTEN = false;
    if(typeof global === 'undefined'){
        g = window;
    }else{
        g = global;
    }

    if(typeof g['TAP_VERSION_WRITTEN'] === 'undefined'){
        Object.defineProperty(g, 'TAP_VERSION_WRITTEN', {
            get(){
                return TAP_VERSION_WRITTEN;
            }
        });
    }

    return ()=>{
        if(g.TAP_VERSION_WRITTEN) return;
        console.log('TAP version 13');
        TAP_VERSION_WRITTEN = true;
    };
})();

export default writeVersion;
