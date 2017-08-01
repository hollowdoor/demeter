demeter
=======

**Warning:** Don't use yet unless you want to just mess around.

Install
------

`npm install --save-dev demeter`

Import from this module
-----------------

```javascript
import test from 'demeter';
```

Run a test
---------

```javascript
let t = test()
.test('assert 1 should pass', t=>{
    t.assert(true);
})
.test('assert 2 should fail', t=>{
    t.assert(false);
}).run();
```
