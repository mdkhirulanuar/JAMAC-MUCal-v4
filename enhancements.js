/* MU Validate Pro v4.2: portable save/load, manual print, decimal display policy */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const fixed=(v,d)=>Number(v).toFixed(d);
  function getState(){try{return JSON.parse(localStorage.getItem('mu-state-v4')||'{}');}catch(_){return{};}}
  function exportProject(){
    const s=getState(), payload={format:'MU Validate Pro Project',version:'4.2',savedAt:new Date().toISOString(),data:s};
    const text=JSON.stringify(payload,null,2), blob=new Blob([text],{type:'application/json'}), a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=((s.jobRef||s.projectName||'MU-Calculation').replace(/[^a-z0-9._-]+/gi,'_'))+'_MU.json';a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function importProject(file){
    const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result),s=x.data||x;if(!Array.isArray(s.readings)||s.readings.length<2)throw 0;localStorage.setItem('mu-state-v4',JSON.stringify(s));window.location.reload();}catch(_){alert('Unable to load this MU project file.');}};r.readAsText(file);
  }
  function printManual(){if(!$('results-card')||$('results-card').hidden){alert('Please calculate first.');return;}document.body.classList.add('print-manual-only');window.print();}
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
