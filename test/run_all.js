const run = require('../').run;
const path = require('path');

run('test*.js', {cwd: path.join(process.cwd(), './test')})
.then(v=>console.log(v))
.catch(e=>console.error(e));
