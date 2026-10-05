'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('script.js','utf8');
const start=source.indexOf('function coverageFactor95'),end=source.indexOf('function syncStateFromInputs');
assert(start>=0&&end>start,'Unable to locate calculation engine');
const context={JAMAC_T95:[[1,12.71],[2,4.30],[3,3.18],[4,2.78],[5,2.57],[6,2.45],[7,2.36],[8,2.31],[9,2.26],[10,2.23],[11,2.20],[12,2.18],[13,2.16],[14,2.14],[15,2.13],[16,2.12],[17,2.11],[18,2.10],[19,2.09],[20,2.09],[25,2.06],[30,2.04],[35,2.03],[40,2.02],[45,2.01],[50,2.01],[60,2.00],[70,1.99],[80,1.99],[90,1.99],[100,1.98],[110,1.98],[120,1.98]],U2_DOF:60,Math,Number,Infinity};
vm.createContext(context);vm.runInContext(source.slice(start,end)+'\nthis.calculate=calculate;this.validate=validate;this.coverageFactor95=coverageFactor95;this.coverageDf95=coverageDf95;this.roundUp3=roundUp3;',context);
const base={readings:[-0.0349,-0.0374,-0.0374,-0.0349,-0.0349,-0.0324,-0.0349,-0.0349,-0.0324,-0.0374],cmc:0.04,refStdError:-0.0200,muCert:0.04,kCert:2,resolution:0.0001,historicalDrift:0.012,tempCoeff:0.002,deltaTemp:2,coverageMode:'auto',fixedK:2,excelMU:0.043};
const near=(a,e,t,l)=>assert(Math.abs(a-e)<=t,`${l}: expected ${e}, got ${a}`);
let passed=0;function test(name,fn){fn();passed++;console.log('PASS',name);}

// KAT-01 baseline.
test('KAT-01 baseline known answer',()=>{const c=context.calculate({...base});near(c.avg,-0.03515,1e-15,'mean');near(c.correctionFactor,0.02,1e-15,'CF');near(c.correctedAvg,-0.01515,1e-15,'corrected mean');near(c.uc,0.02129963484298368,1e-14,'uc');assert.strictEqual(c.lookupDf,70);assert.strictEqual(c.k95,1.99);near(c.ue,c.uc*1.99,1e-15,'U');assert.strictEqual(c.ueRounded,0.043);assert.strictEqual(c.reportedMU,0.043);});
// KAT-02 sign propagation.
test('KAT-02 positive reference error gives negative correction',()=>{const c=context.calculate({...base,refStdError:0.02});near(c.correctionFactor,-0.02,1e-15,'CF');near(c.correctedAvg,c.avg-0.02,1e-15,'corrected mean');});
// KAT-03 zero correction.
test('KAT-03 zero reference correction',()=>{const c=context.calculate({...base,refStdError:0});assert.strictEqual(c.correctionFactor,0);near(c.correctedAvg,c.avg,1e-15,'corrected mean');});
// KAT-04 zero repeatability.
test('KAT-04 zero repeatability',()=>{const c=context.calculate({...base,readings:[0.01,0.01,0.01,0.01]});near(c.stdDev,0,1e-15,'s');near(c.u1,0,1e-15,'u1');});
// KAT-05 n=2 sample statistics.
test('KAT-05 minimum n=2',()=>{const c=context.calculate({...base,readings:[-0.01,0.01]});near(c.stdDev,Math.sqrt(0.0002),1e-15,'sample s');near(c.u1,0.01,1e-15,'u1');assert.strictEqual(c.v1,1);});

// BT-01 Student-t lookup boundaries.
test('BT-01 Student-t boundaries',()=>{[[1,1,12.71],[24.999,20,2.09],[25,25,2.06],[69.999,60,2],[70,70,1.99],[119.999,110,1.98],[120,120,1.98],[1000,120,1.98]].forEach(([v,df,k])=>{assert.strictEqual(context.coverageDf95(v),df);assert.strictEqual(context.coverageFactor95(v),k);});assert.strictEqual(context.coverageDf95(Infinity),'∞');assert.strictEqual(context.coverageFactor95(Infinity),1.96);});
// BT-02 fixed factor override.
test('BT-02 fixed ILC coverage factor',()=>{const c=context.calculate({...base,coverageMode:'fixed',fixedK:2});assert.strictEqual(c.k95,2);assert.notStrictEqual(c.k95,c.studentK95);near(c.ue,c.uc*2,1e-15,'fixed U');assert.strictEqual(c.coverageSource,'Fixed / ILC protocol');});
// BT-03 upward rounding boundaries.
test('BT-03 upward rounding',()=>{assert.strictEqual(context.roundUp3(0.043),0.043);assert.strictEqual(context.roundUp3(0.0430001),0.044);assert.strictEqual(context.roundUp3(0.045274),0.046);});
// BT-04 CMC floor.
test('BT-04 CMC decision',()=>{const low=context.calculate({...base,coverageMode:'fixed',fixedK:1,cmc:0.04});assert.strictEqual(low.belowCmc,true);assert.strictEqual(low.reportedMU,0.04);const equal=context.calculate({...base,coverageMode:'fixed',fixedK:1,cmc:low.ueRounded});assert.strictEqual(equal.belowCmc,false);assert.strictEqual(equal.reportedMU,low.ueRounded);});
// BT-05 small non-zero components retained.
test('BT-05 small components',()=>{const c=context.calculate({...base,resolution:1e-9,historicalDrift:1e-9,tempCoeff:1e-9,deltaTemp:1});assert(c.u3>0&&c.u4>0&&c.u5>0);});
// BT-06 validation rejection.
test('BT-06 invalid inputs',()=>{const cases=[{readings:[1]},{cmc:0},{muCert:0},{kCert:0},{resolution:-1},{historicalDrift:-1},{tempCoeff:-1},{deltaTemp:-1},{coverageMode:'bad'},{coverageMode:'fixed',fixedK:0}];for(const patch of cases)assert(context.validate({...base,...patch}).length>0,JSON.stringify(patch));});
// Independence from Excel comparison.
test('Excel comparison value cannot drive engine',()=>{const a=context.calculate({...base,excelMU:0.001}),b=context.calculate({...base,excelMU:999});near(a.reportedMU,b.reportedMU,0,'reported MU');near(a.uc,b.uc,0,'uc');});
console.log(`PASS: ${passed} executable calculation tests`);
