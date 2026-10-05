'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync('script.js', 'utf8');
const start = source.indexOf('function coverageFactor95');
const end = source.indexOf('function syncStateFromInputs');
assert(start >= 0 && end > start, 'Unable to locate calculation engine in script.js');

const engine = source.slice(start, end);
const context = {
  JAMAC_T95: [[1,12.71],[2,4.30],[3,3.18],[4,2.78],[5,2.57],[6,2.45],[7,2.36],[8,2.31],[9,2.26],[10,2.23],[11,2.20],[12,2.18],[13,2.16],[14,2.14],[15,2.13],[16,2.12],[17,2.11],[18,2.10],[19,2.09],[20,2.09],[25,2.06],[30,2.04],[35,2.03],[40,2.02],[45,2.01],[50,2.01],[60,2.00],[70,1.99],[80,1.99],[90,1.99],[100,1.98],[110,1.98],[120,1.98]],
  U2_DOF: 60,
  Math, Number, Infinity
};
vm.createContext(context);
vm.runInContext(engine + '\nthis.calculate=calculate;this.validate=validate;', context);

const base = {
  readings:[-0.0349,-0.0374,-0.0374,-0.0349,-0.0349,-0.0324,-0.0349,-0.0349,-0.0324,-0.0374],
  cmc:0.04, refStdError:-0.0200, muCert:0.04, kCert:2,
  resolution:0.0001, historicalDrift:0.012, tempCoeff:0.002,
  deltaTemp:2, coverageMode:'auto', fixedK:2
};

function near(actual, expected, tol, label) {
  assert(Math.abs(actual - expected) <= tol, label + ': expected ' + expected + ', got ' + actual);
}

// CF-01 Auto backward compatibility.
let auto = context.calculate({...base});
assert.strictEqual(auto.k95, auto.studentK95);
assert.strictEqual(auto.coverageSource, "Student's-t 95%");
near(auto.ue, auto.uc * auto.studentK95, 1e-15, 'Auto U');

// CF-02 Fixed / ILC k=2.
let fixed = context.calculate({...base, coverageMode:'fixed', fixedK:2});
assert.strictEqual(fixed.k95, 2);
assert.strictEqual(fixed.coverageSource, 'Fixed / ILC protocol');
near(fixed.ue, fixed.uc * 2, 1e-15, 'Fixed U');
near(fixed.uc, 0.02129963483488669, 1e-14, 'Reference uc');
near(fixed.ue, 0.04259926966977338, 1e-14, 'Reference U');
assert.strictEqual(fixed.ueRounded, 0.043);

// Fixed factor must override Student's-t, while reference remains available.
assert.notStrictEqual(fixed.k95, fixed.studentK95);

// CF-03 invalid fixed k.
assert(context.validate({...base, coverageMode:'fixed', fixedK:0}).some(x => x.includes('greater than 0')));
assert(context.validate({...base, coverageMode:'fixed', fixedK:-2}).some(x => x.includes('greater than 0')));

// Invalid mode must fail.
assert(context.validate({...base, coverageMode:'manual'}).some(x => x.includes('Coverage factor mode')));

console.log('PASS: calculation regression tests');
console.log('Auto k =', auto.k95, 'Fixed k =', fixed.k95);
console.log('uc =', fixed.uc, 'Fixed U =', fixed.ue, 'Rounded U =', fixed.ueRounded);
