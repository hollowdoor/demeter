demeter
=======

**Warning:** Don't use yet unless you want to just mess around.

Install
------

`npm install --save-dev demeter`

Intro
-----

`demeter` prints TAP output.

Import from this module
-----------------

```javascript
import { test } from 'demeter';
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

Assertions
----------

The message argument is an optional argument.

### t.assert(boolean, message), t.ok(boolean, message)

Throw if `boolean` is false.

### t.ok(boolean, message), t.ok(boolean, message)

Throw if `boolean` is false. Just like `t.assert()`.

### t.not(boolean, message)

Throw if `boolean` is true.

### t.equal(value1, value2, message)

Throw if `value1` is not equal to `value2`. This is a strict equal, or in other words `t.equal()` uses (**===**) the **Identity operator**

### t.equalish(value1, value2, message)

Throw if `value1` is not equal to `value2`. This is a non-strict equal. `t.equalish()` converts value types using (**==**).

### t.notEqual(value1, value2, message)

Throw if `value1` is equal to `value2` using strict comparison.

### t.notEqualish(value1, value2, message)

Throw if `value1` is equal to `value2` using non-strict comparison.

### t.fail(message)

Just throw right away if `t.fail()` is called.

### t.deepEqual(object1, object2, message)

Throw if `object1` is not deeply equal to `object2` using strict comparison.

### t.deepEqual(object1, object2, message)

Throw if `object1` is not deeply equal to `object2` using non-strict comparison.
