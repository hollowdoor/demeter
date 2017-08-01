export function run(pattern, options, args){

    if(typeof options === 'undefined'){
        options = {};
        args = [];
    }else if(typeof args === 'undefined'){
        if(Object.prototype.toString.call(options) === '[object Array]'){
            args = options;
            options = {};
        }else{
            args = [];
        }
    }

    options.env = Object.assign(options.env || {}, {
        TEST_ENVIRONMENT: true
    });

    try{

        const glob = require('glob-promise');
        const path = require('path');
        const cwd = process.cwd();
        //console.log('cwd ',cwd)
        //console.log('options ',options)
        return glob(pattern, options).then(files=>{
            //console.log('files ',files)
            return Promise.all(
                files.map(file=>{
                    return spawn(
                        [file].concat(args),
                        //[path.join(cwd, file)].concat(args),
                        options
                    );
                })
            );
        });

    }catch(e){
        return Promise.reject(e);
    }
}

function spawn(args=[], options = {}){
    try{
        const tapMerge = require('tap-merge');
        const multistream = require('multistream');
        const spawnCP = require('child_process').spawn;

        const out = tapMerge();
        //out.pipe(process.stdout);

        options.stdio = [null, 'pipe', null];

        return new Promise((resolve, reject)=>{
            let cp = spawnCP('node', args, options);
            cp.on('exit', resolve);
            cp.on('error', reject);
            //multistream([cp.stdout, cp.stderr]).pipe(out).pipe(process.stdout);
            cp.stdout.pipe(out).pipe(process.stdout);
            //cp.stderr.pipe(out).pipe(process.stderr);
        });
    }catch(e){
        return Promise.reject(e);
    }
}
