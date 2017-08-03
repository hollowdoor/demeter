const test = require('../').test;
/*
test({
    description: 'resolvable test',
    count: 1,
    print(complete){
        let output = complete.tap();
        console.log(output);
    },
    run(controls){
        return controls.resolve((t)=>{
            t.fail();
        });
    }
})
.run()
.catch(e=>console.log(e));

test({
    description: 'resolvable test with sub test',
    count: 1,
    print(complete){
        let output = complete.tap();
        console.log(output);
    },
    run(controls){
        return controls.resolve((t)=>{
            return test({
                description: 'sub test',
                count: 1,
                print(complete){
                    let output = complete.tap();
                    console.log(output);
                },
                run(controls){
                    return controls.resolve((t)=>{
                        t.fail();
                    });
                }
            });
        });
    }
})
.run()
.catch(e=>console.log(e));
*/
let t = test()
.test('assert 1 should pass', t=>{
    t.assert(true, 'first assert');
})
.test('assert 2 should fail', t=>{
    t.assert(false, 'a failed assert');
})
.reverse('acync promise test should fail', async t=>{
    await Promise.reject().catch(e=>t.reject());
})

test()
.take(t)
.test('assert 3 should fail', t=>{
    t.assert(true);
    t.assert(false);
    t.assert(true);
})
.test('.equal should pass', t=>t.equal(1, 1))
.test('.equal should fail', t=>t.equal(1, 2))
.reverse('test() assert 1 should fail', t=>{
    return test().test('assert should fail', t2=>{
        t2.assert(false);
    });
})
.reverse('test() rethrow should fail', t=>{
    return test().test('assert 2 should fail', t=>{
        t.assert(false);
    });
})

.test(t=>{
    t.assert(false);
})
.test('.fail', t=>t.fail())

.test('promise should fail', t=>Promise.resolve().then(v=>t.fail()))
.test('# TODO thing', t=>{})
.test('# PASS passing', t=>{})
.reverse('.equal fail reversed', t=>{
    return test().test('', t=>t.equal(1, 2));
})
.reverse('rethrow should fail', t=>{
    return thorny().test('', t=>t.fail());
})
.reverse('promise should reject', t=>{
    return Promise.resolve().then(v=>t.reject('rejected'));
})
.run()
.catch(e=>console.log('all failed ', e));
