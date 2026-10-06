/* MU Validate Pro v4.3: portable save/load, manual print, decimal display policy */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const fixed=(v,d)=>Number(v).toFixed(d);
  function getState(){try{return JSON.parse(localStorage.getItem('mu-state-v4')||'{}');}catch(_){return{};}}
  function exportProject(){
    const s=getState();if(!confirmTraceability('export the project'))return;const payload={format:'MU Validate Pro Project',version:'4.2',owner:'Mohd Khirul Anuar Bin Saadon',developer:'Mohd Khirul Anuar Bin Saadon',purpose:'Internal verification and validation of JAMAC Metering MU calculations',savedAt:new Date().toISOString(),data:s};
    const text=JSON.stringify(payload,null,2), blob=new Blob([text],{type:'application/json'}), a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=((s.jobRef||s.projectName||'MU-Calculation').replace(/[^a-z0-9._-]+/gi,'_'))+'_MU.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function validateImportedState(s){
    if(!s||typeof s!=='object'||Array.isArray(s))return false;
    if(!Array.isArray(s.readings)||s.readings.length<2||s.readings.some(v=>!Number.isFinite(v)))return false;
    const positive=['cmc','muCert','kCert'],nonNegative=['resolution','historicalDrift','tempCoeff','deltaTemp'];
    if(positive.some(k=>!Number.isFinite(s[k])||!(s[k]>0)))return false;
    if(nonNegative.some(k=>!Number.isFinite(s[k])||s[k]<0))return false;
    if(!Number.isFinite(s.refStdError))return false;
    const mode=s.coverageMode??'auto';
    if(!['auto','fixed'].includes(mode))return false;
    if(mode==='fixed'&&(!Number.isFinite(s.fixedK)||!(s.fixedK>0)))return false;
    return true;
  }
  function importProject(file){
    const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result),s=x.data||x;if(!validateImportedState(s))throw 0;if(s.coverageMode===undefined)s.coverageMode='auto';if(s.fixedK===undefined)s.fixedK=2;localStorage.setItem('mu-state-v4',JSON.stringify(s));window.location.reload();}catch(_){alert('Unable to load this MU project file: invalid or incomplete calculation data.');}};r.readAsText(file);
  }
  function traceabilityIncomplete(s){const text=['jobRef','customer','meterMfr','meterModel','meterSN','refStdDesc','refStdSN','refStdTrace'];return text.some(k=>!String(s[k]??'').trim())||!Number.isFinite(s.ratedCurrent)||!Number.isFinite(s.ratedVoltage)||!Number.isFinite(s.meterClass)||!String(s.meterType??'').trim()||!String(s.energyType??'').trim()||!String(s.testPhase??'').trim()||!String(s.testPF??'').trim()||!Number.isFinite(s.testVoltage)||!Number.isFinite(s.testCurrent);}
  function confirmTraceability(action){return !traceabilityIncomplete(getState())||confirm('Traceability information is incomplete. Continue to '+action+' anyway?');}
  function printManual(){if(!$('results-card')||$('results-card').hidden){alert('Please calculate first.');return;}if(!confirmTraceability('print the report'))return;document.body.classList.add('print-manual-only');window.print();}
  function firstNumber(el,d){if(!el)return;const m=el.textContent.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/i);if(!m)return;const v=Number(m[0]);if(Number.isFinite(v))el.textContent=el.textContent.replace(m[0],fixed(v,d));}
  function decimals(){
    const st=[...document.querySelectorAll('#steps-container .step')];if(st.length<15)return;
    st[2].querySelectorAll('tbody td:nth-child(4)').forEach(e=>firstNumber(e,6));
    st[3].querySelectorAll('tbody td:nth-child(2),tbody td:nth-child(3),tbody td:nth-child(4)').forEach(e=>firstNumber(e,6));
    [4,5,6,7,8,9,10].forEach(i=>st[i].querySelectorAll('.result-line .vl').forEach(e=>firstNumber(e,6)));
    const s14=st[13].querySelectorAll('.calc-line .vl');if(s14[0])firstNumber(s14[0],6);if(s14[1])firstNumber(s14[1],3);
    const rows=[...document.querySelectorAll('#summary-container .summary-table tr')];[4,5,6,7,8,9].forEach(i=>{if(rows[i])firstNumber(rows[i].cells[1],6);});
  }
  function install(){
    const actions=document.querySelector('.top-bar .actions');if(!actions)return;
    const old=actions.querySelector('button[onclick*="print"]');if(old)old.remove();
    const save=document.createElement('button');save.textContent='💾⬇';save.title='Save project file to laptop';save.onclick=exportProject;
    const load=document.createElement('button');load.textContent='📂⬆';load.title='Load project file from laptop';
    const pick=document.createElement('input');pick.type='file';pick.accept='.json';pick.hidden=true;pick.onchange=()=>{if(pick.files[0])importProject(pick.files[0]);};load.onclick=()=>pick.click();
    const print=document.createElement('button');print.textContent='🖨️';print.title='Print manual calculation only';print.onclick=printManual;
    actions.append(save,load,print,pick);
    const calc=$('btn-calculate');if(calc)calc.addEventListener('click',()=>setTimeout(decimals,0));
  }
  window.addEventListener('afterprint',()=>document.body.classList.remove('print-manual-only'));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
