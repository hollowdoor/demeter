const thorny = require('../').thorny;

let t = thorny()
.test('assert 1 should pass', t=>{
    t.assert(true);
})
.test('assert 2 should fail', t=>{
    t.assert(false);
}).done();
