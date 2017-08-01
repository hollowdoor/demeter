const clear = (()=>{
    if(typeof console.clear === 'function'){
        return ()=>console.clear();
    }else{
        return require('clear');
    }
});

export default clear;
