const str = a => (
    typeof a === 'object'
    ? JSON.stringify(a, null, 2)
    : a
);

const m = fn => (message, ...values) => (
    message
    ? message
    : fn(...values.map(v=>str(v)))
);

const bool = (v, s) => typeof v === 'boolean' ? v : v + s;

const showEqual = m((a, b) => a + ' equal to ' + b);
const showNotEqual = m((a, b) => a + ' not equal to ' + b);
const showTrue = m(a => a + ' is truthy');
const showFalse = m(a => a + ' is falsy');

export {
    showEqual, showNotEqual, showTrue, showFalse
};
