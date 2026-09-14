/**
 * MU Validate Pro v4.0
 * Energy Meter Calibration · Measurement Uncertainty Validator
 * Upgrade from v3.3: correction factor, corrected error, manual historical drift,
 * full manual calculation trail, Type-B infinite DoF default.
 */
(() => {
  'use strict';

  const defaults = {
    projectName: 'Parameter 1',
    jobRef: '', customer: '', meterMfr: '', meterModel: '', meterSN: '',
    refStdDesc: '', refStdSN: '', refStdTrace: '',
    ratedCurrent: 5, ratedVoltage: 240, meterClass: 1.0, meterType: 'DIRECT',
    energyType: '+P', testVoltage: 240, testCurrent: 0.1, testPF: '1', testPhase: 'ABC',
    readings: [-0.0349, -0.0374, -0.0374, -0.0349, -0.0349, -0.0324, -0.0349, -0.0349, -0.0324, -0.0374],
    cmc: 0.04,
    refStdError: -0.0200,
    muCert: 0.04,
    kCert: 2,
    resolution: 0.0001,
    historicalDrift: 0.012,
    tempCoeff: 0.002,
    deltaTemp: 2,
    excelMU: 0.04
  };

  let state = structuredCloneSafe(defaults);
  let currentTheme = localStorage.getItem('mu-theme-v4') || 'dark';

  const $ = id => document.getElementById(id);
  const main = $('main-content');
  const toast = $('toast');
  const saveModal = $('save-modal');
  const loadModal = $('load-modal');

  function structuredCloneSafe(obj) { return JSON.parse(JSON.stringify(obj)); }
  function esc(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function fmt(v, d = 5) {
    if (!Number.isFinite(v)) return v === Infinity ? '∞' : '—';
    if (v !== 0 && Math.abs(v) < Math.pow(10, -d)) return v.toExponential(Math.max(2, d - 2));
    return v.toFixed(d);
  }
  function signed(v, d = 5) { return `${v >= 0 ? '+' : ''}${fmt(v, d)}`; }
  function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }
  function saveDraft() { try { localStorage.setItem('mu-state-v4', JSON.stringify(state)); } catch (_) {} }
  function loadDraft() {
    try {
      const s = localStorage.getItem('mu-state-v4');
      if (s) state = Object.assign(structuredCloneSafe(defaults), JSON.parse(s));
    } catch (_) {}
  }

  function applyTheme() {
    document.body.classList.toggle('light', currentTheme === 'light');
    $('btn-darkmode').textContent = currentTheme === 'light' ? '☀️' : '🌙';
    localStorage.setItem('mu-theme-v4', currentTheme);
  }

  function coverageFactor95(v) {
    if (!Number.isFinite(v) || v >= 120) return 1.960;
    const df = Math.max(1, Math.floor(v));
    const table = [
      [1,12.706],[2,4.303],[3,3.182],[4,2.776],[5,2.571],[6,2.447],[7,2.365],[8,2.306],[9,2.262],[10,2.228],
      [11,2.201],[12,2.179],[13,2.160],[14,2.145],[15,2.131],[16,2.120],[17,2.110],[18,2.101],[19,2.093],[20,2.086],
      [21,2.080],[22,2.074],[23,2.069],[24,2.064],[25,2.060],[26,2.056],[27,2.052],[28,2.048],[29,2.045],[30,2.042],
      [40,2.021],[50,2.009],[60,2.000],[80,1.990],[100,1.984],[120,1.980]
    ];
    let selected = table[0][1];
    for (const [d, k] of table) {
      if (df >= d) selected = k; else break;
    }
    return selected;
  }

  function roundUp3(v) { return Math.ceil((v - Number.EPSILON) * 1000) / 1000; }

  function validate(s) {
    const e = [];
    if (!Array.isArray(s.readings) || s.readings.length < 2) e.push('Minimum 2 readings are required.');
    if (s.readings.some(v => !Number.isFinite(v))) e.push('All readings must be valid numbers.');
    if (!(s.cmc > 0)) e.push('Laboratory CMC must be greater than 0.');
    if (!Number.isFinite(s.refStdError)) e.push('Reference Standard Error must be a valid signed number.');
    if (!(s.muCert > 0)) e.push('Calibration certificate expanded uncertainty must be greater than 0.');
    if (!(s.kCert > 0)) e.push('Certificate coverage factor k must be greater than 0.');
    if (!(s.resolution >= 0)) e.push('Reference standard resolution cannot be negative.');
    if (!(s.historicalDrift >= 0)) e.push('Historical drift must be entered as a non-negative magnitude.');
    if (!(s.tempCoeff >= 0)) e.push('Temperature coefficient cannot be negative.');
    if (!(s.deltaTemp >= 0)) e.push('Δ Temperature cannot be negative.');
    return e;
  }

  function calculate(s) {
    const n = s.readings.length;
    const sum = s.readings.reduce((a,b) => a + b, 0);
    const avg = sum / n;

    // Correction is a deterministic correction to the result, not an uncertainty component.
    const correctionFactor = -s.refStdError;
    const correctedReadings = s.readings.map(x => x + correctionFactor);
    const correctedAvg = avg + correctionFactor;

    // Repeatability: adding the same correction to every reading does not change deviations or s.
    const deviations = s.readings.map(x => x - avg);
    const squares = deviations.map(d => d * d);
    const sumSquares = squares.reduce((a,b) => a + b, 0);
    const variance = sumSquares / (n - 1);
    const stdDev = Math.sqrt(variance);
    const u1 = stdDev / Math.sqrt(n);

    // Type B components.
    const u2 = s.muCert / s.kCert;
    const semiResolution = s.resolution / 2;
    const u3 = semiResolution / Math.sqrt(3);
    const u4 = s.historicalDrift / Math.sqrt(3);
    const tempEffect = s.tempCoeff * s.deltaTemp;
    const u5 = tempEffect / Math.sqrt(3);

    const components = [u1,u2,u3,u4,u5];
    const squaresU = components.map(u => u*u);
    const sumSquaresU = squaresU.reduce((a,b) => a+b, 0);
    const uc = Math.sqrt(sumSquaresU);

    // Welch-Satterthwaite: U1 has finite DoF n-1. Type B components default to infinite DoF.
    const v1 = n - 1;
    const wsDen = u1 === 0 ? 0 : Math.pow(u1,4) / v1;
    const veff = wsDen > 0 ? Math.pow(uc,4) / wsDen : Infinity;
    const k95 = coverageFactor95(veff);
    const ue = uc * k95;
    const ueRounded = roundUp3(ue);

    // Reporting control retained from v3 workflow. Verify applicability against laboratory/accreditation policy.
    const belowCmc = ueRounded < s.cmc;
    const reportedMU = belowCmc ? s.cmc : ueRounded;

    return {
      n,sum,avg,correctionFactor,correctedReadings,correctedAvg,
      deviations,squares,sumSquares,variance,stdDev,u1,v1,
      u2,semiResolution,u3,u4,tempEffect,u5,
      components,squaresU,sumSquaresU,uc,wsDen,veff,k95,ue,ueRounded,belowCmc,reportedMU
    };
  }

  function syncStateFromInputs() {
    const textFields = ['jobRef','customer','meterMfr','meterModel','meterSN','refStdDesc','refStdSN','refStdTrace','meterType','energyType','testPF','testPhase'];
    textFields.forEach(k => { const el = $(`in-${k}`); if (el) state[k] = el.value; });
    const numberFields = ['ratedCurrent','ratedVoltage','meterClass','testVoltage','testCurrent','cmc','refStdError','muCert','kCert','resolution','historicalDrift','tempCoeff','deltaTemp','excelMU'];
    numberFields.forEach(k => { const el = $(`in-${k}`); if (el) state[k] = Number(el.value); });
    saveDraft();
  }

  function inputGroup(label, id, value, opts = {}) {
    const cls = opts.className ? `form-group ${opts.className}` : 'form-group';
    const attrs = [
      opts.type === 'text' ? 'type="text"' : 'type="number"',
      `id="in-${id}"`,
      `value="${esc(value)}"`,
      opts.step ? `step="${opts.step}"` : '',
      opts.readonly ? 'readonly' : '',
      opts.min !== undefined ? `min="${opts.min}"` : ''
    ].join(' ');
    return `<div class="${cls}"><label>${label}</label><input ${attrs}>${opts.note ? `<span class="note">${opts.note}</span>` : ''}</div>`;
  }

  function renderReadings() {
    const c = $('readings-dynamic'); if (!c) return;
    c.innerHTML = state.readings.map((v,i) => `<div class="reading-row">
      <span class="row-num">#${i+1}</span>
      <input type="number" step="0.0001" value="${v}" data-reading="${i}">
      ${state.readings.length > 2 ? `<button class="small-btn" data-remove-reading="${i}" title="Remove">✕</button>` : ''}
    </div>`).join('');
    const sum = state.readings.reduce((a,b)=>a+b,0), avg = sum/state.readings.length;
    $('readings-summary').innerHTML = `<strong>n = ${state.readings.length}</strong> &nbsp; | &nbsp; Sum = ${fmt(sum,5)}% &nbsp; | &nbsp; Average = <strong>${fmt(avg,5)}%</strong>`;

    c.querySelectorAll('[data-reading]').forEach(el => el.addEventListener('change', e => {
      const i = Number(e.target.dataset.reading), v = Number(e.target.value);
      if (Number.isFinite(v)) { state.readings[i] = v; saveDraft(); renderReadings(); }
    }));
    c.querySelectorAll('[data-remove-reading]').forEach(btn => btn.addEventListener('click', e => {
      const i = Number(e.currentTarget.dataset.removeReading);
      if (state.readings.length <= 2) return showToast('Minimum 2 readings required');
      state.readings.splice(i,1); saveDraft(); renderReadings();
    }));
  }

  function renderApp() {
    const cf = -Number(state.refStdError || 0);
    main.innerHTML = `
      <section class="card">
        <div class="card-header"><span>📁</span><h3>Job Information</h3></div>
        <div class="grid">
          ${inputGroup('Job Reference','jobRef',state.jobRef,{type:'text'})}
          ${inputGroup('Customer','customer',state.customer,{type:'text'})}
          ${inputGroup('Meter Manufacturer','meterMfr',state.meterMfr,{type:'text'})}
          ${inputGroup('Meter Model / Type','meterModel',state.meterModel,{type:'text'})}
          ${inputGroup('Meter Serial Number','meterSN',state.meterSN,{type:'text'})}
          ${inputGroup('Reference Standard Description','refStdDesc',state.refStdDesc,{type:'text'})}
          ${inputGroup('Reference Standard Serial No.','refStdSN',state.refStdSN,{type:'text'})}
          ${inputGroup('Traceability / Cal Cert No.','refStdTrace',state.refStdTrace,{type:'text'})}
        </div>
      </section>

      <section class="card">
        <div class="card-header"><span>📋</span><h3>Meter Information & Test Parameters</h3></div>
        <div class="grid">
          ${inputGroup('Rated Current (A)','ratedCurrent',state.ratedCurrent,{step:'0.1'})}
          ${inputGroup('Rated Voltage (V)','ratedVoltage',state.ratedVoltage,{step:'1'})}
          ${inputGroup('Accuracy Class','meterClass',state.meterClass,{step:'0.1'})}
          <div class="form-group"><label>Meter Type</label><select id="in-meterType"><option ${state.meterType==='DIRECT'?'selected':''}>DIRECT</option><option ${state.meterType==='CT'?'selected':''}>CT</option><option ${state.meterType==='CT-VT'?'selected':''}>CT-VT</option></select></div>
        </div>
        <div class="test-strip">
          <div class="form-group"><label>Energy</label><select id="in-energyType"><option value="+P" ${state.energyType==='+P'?'selected':''}>+P Import</option><option value="-P" ${state.energyType==='-P'?'selected':''}>-P Export</option><option value="+Q" ${state.energyType==='+Q'?'selected':''}>+Q Import</option><option value="-Q" ${state.energyType==='-Q'?'selected':''}>-Q Export</option></select></div>
          <div class="form-group"><label>Phase</label><select id="in-testPhase"><option ${state.testPhase==='ABC'?'selected':''}>ABC</option><option ${state.testPhase==='A'?'selected':''}>A</option><option ${state.testPhase==='B'?'selected':''}>B</option><option ${state.testPhase==='C'?'selected':''}>C</option></select></div>
          <div class="form-group"><label>Power Factor</label><select id="in-testPF"><option ${state.testPF==='1'?'selected':''}>1</option><option value="0.5L" ${state.testPF==='0.5L'?'selected':''}>0.5L</option><option value="0.866L" ${state.testPF==='0.866L'?'selected':''}>0.866L</option></select></div>
          ${inputGroup('Test Voltage (V)','testVoltage',state.testVoltage,{step:'1'})}
          ${inputGroup('Test Current (A)','testCurrent',state.testCurrent,{step:'0.001'})}
        </div>
      </section>

      <section class="card">
        <div class="card-header"><span>🔢</span><h3>Readings & Uncertainty Components</h3></div>
        <div class="readings-layout">
          <div>
            <div id="readings-dynamic"></div>
            <button id="btn-add-reading" class="add-btn">＋ Add Reading</button>
            <div id="readings-summary" class="reading-summary"></div>
          </div>
          <div>
            <div class="grid">
              ${inputGroup('Laboratory CMC (%)','cmc',state.cmc,{step:'0.001',min:0,className:'warning-box',note:'Reporting comparison value from approved laboratory scope/policy.'})}
              ${inputGroup('Ref. Standard Error from Cal Cert (%)','refStdError',state.refStdError,{step:'0.0001',note:'Enter the signed error exactly as stated for the applicable point.'})}
              <div class="form-group readonly highlight"><label>Correction Factor, CF (%) — Auto</label><input id="out-cf" value="${signed(cf,5)}" readonly><span class="note">CF = −(Reference Standard Error). Do not enter manually.</span></div>
              ${inputGroup('MU from Calibration Certificate (%)','muCert',state.muCert,{step:'0.0001',min:0})}
              ${inputGroup('Coverage Factor (k) from Cert','kCert',state.kCert,{step:'0.01',min:0})}
              ${inputGroup('Resolution of Ref. Std (%)','resolution',state.resolution,{step:'0.0001',min:0})}
              ${inputGroup('Historical Drift of Ref. Std (%)','historicalDrift',state.historicalDrift,{step:'0.0001',min:0,note:'Manual non-negative drift/stability magnitude established by the laboratory.'})}
              ${inputGroup('Temperature Coefficient (%/°C)','tempCoeff',state.tempCoeff,{step:'0.0001',min:0})}
              ${inputGroup('Δ Temperature (±°C)','deltaTemp',state.deltaTemp,{step:'0.1',min:0})}
              ${inputGroup('Excel MU Value (%)','excelMU',state.excelMU,{step:'0.001',min:0})}
            </div>
          </div>
        </div>
        <div class="btn-row"><button id="btn-calculate" class="btn primary">⚡ Calculate & Validate</button><button id="btn-reset" class="btn secondary">Reset Example</button></div>
      </section>

      <section class="card" id="results-card" hidden>
        <h2 class="results-title">🧮 Full Manual Calculation Trail</h2>
        <div id="correction-summary"></div>
        <div id="steps-container"></div>
      </section>

      <section class="card" id="summary-card" hidden><div id="summary-container"></div></section>
      <section class="card" id="excel-card" hidden><div id="excel-container"></div></section>
    `;

    renderReadings();
    bindInputs();

    $('btn-add-reading').addEventListener('click', () => {
      state.readings.push(state.readings[state.readings.length-1] ?? 0); saveDraft(); renderReadings();
    });
    $('btn-calculate').addEventListener('click', runCalculation);
    $('btn-reset').addEventListener('click', () => { state = structuredCloneSafe(defaults); saveDraft(); renderApp(); showToast('Example values restored'); });
  }

  function bindInputs() {
    main.querySelectorAll('input[id^="in-"],select[id^="in-"]').forEach(el => {
      el.addEventListener('change', () => {
        syncStateFromInputs();
        if (el.id === 'in-refStdError') $('out-cf').value = signed(-state.refStdError,5);
      });
    });
  }

  function step(id, title, type, body) {
    return `<div class="step open"><div class="step-header" tabindex="0"><span class="step-num">${id}</span><span class="step-title">${title}</span><span class="step-type">${type}</span><span class="step-arrow">▼</span></div><div class="step-body">${body}</div></div>`;
  }

  function line(label, expression, result, cls='') {
    return `<div class="calc-line ${cls}"><span class="v">${label}</span> ${expression ? `<span>${expression}</span>` : ''} ${result !== undefined ? `<span class="vl">${result}</span>` : ''}</div>`;
  }

  function renderManual(c, s) {
    $('correction-summary').innerHTML = `
      <div class="correction-result">
        <div class="metric"><span>Average Measured Error</span><strong>${signed(c.avg,5)} %</strong></div>
        <div class="metric"><span>Auto Correction Factor</span><strong>${signed(c.correctionFactor,5)} %</strong></div>
        <div class="metric"><span>Corrected Mean Error</span><strong>${signed(c.correctedAvg,5)} %</strong></div>
      </div>`;

    const readingRows = s.readings.map((x,i) => `<tr><td>${i+1}</td><td>${signed(x,5)}</td><td>${signed(c.correctionFactor,5)}</td><td>${signed(c.correctedReadings[i],5)}</td><td>${signed(c.deviations[i],6)}</td><td>${c.squares[i].toExponential(6)}</td></tr>`).join('');
    const sumExpression = s.readings.map(x => signed(x,4)).join(' + ');
    const uTerms = [c.u1,c.u2,c.u3,c.u4,c.u5].map(u => `(${fmt(u,6)})²`).join(' + ');

    $('steps-container').innerHTML =
      step('STEP 1','Average Measured Error','Manual arithmetic',`
        <div class="formula-box">x̄ = Σxᵢ / n</div>
        ${line('Σxᵢ =', sumExpression, '')}
        ${line('Σxᵢ =','',`${fmt(c.sum,6)} %`)}
        ${line('x̄ =',`${fmt(c.sum,6)} / ${c.n} =`,`${signed(c.avg,6)} %`,'result-line')}
      `) +
      step('STEP 2','Reference Standard Correction','Deterministic correction',`
        <div class="formula-box">CF = −Eref &nbsp;&nbsp; and &nbsp;&nbsp; Ecorrected = x̄ + CF</div>
        ${line('Reference Standard Error, Eref =','',`${signed(s.refStdError,6)} %`)}
        ${line('CF =',`−(${signed(s.refStdError,6)}) =`,`${signed(c.correctionFactor,6)} %`,'result-line')}
        ${line('Corrected Mean Error =',`${signed(c.avg,6)} + (${signed(c.correctionFactor,6)}) =`,`${signed(c.correctedAvg,6)} %`,'result-line')}
        <div class="sub-step-label">Each reading corrected using the same CF</div>
        <table class="manual-table"><thead><tr><th>No.</th><th>Measured Error %</th><th>CF %</th><th>Corrected Error %</th><th>xᵢ−x̄</th><th>(xᵢ−x̄)²</th></tr></thead><tbody>${readingRows}</tbody></table>
        <p class="note">A constant correction shifts all readings equally; therefore it changes the mean result but does not change standard deviation/repeatability.</p>
      `) +
      step('U1','Repeatability','Type A · Normal',`
        <div class="formula-box">s = √[Σ(xᵢ−x̄)²/(n−1)] &nbsp;&nbsp; ; &nbsp;&nbsp; u₁ = s/√n</div>
        ${line('Σ(xᵢ−x̄)² =','',c.sumSquares.toExponential(8))}
        ${line('Variance, s² =',`${c.sumSquares.toExponential(8)} / (${c.n}−1) =`,c.variance.toExponential(8))}
        ${line('s =',`√${c.variance.toExponential(8)} =`,`${fmt(c.stdDev,7)} %`)}
        ${line('u₁ =',`${fmt(c.stdDev,7)} / √${c.n} =`,`${fmt(c.u1,7)} %`,'result-line')}
        ${line('Degrees of freedom, v₁ =',`${c.n} − 1 =`,`${c.v1}`)}
      `) +
      step('U2','Reference Standard Calibration Certificate','Type B · Normal',`
        <div class="formula-box">u₂ = Ucert / kcert</div>
        ${line('Ucert =','',`${fmt(s.muCert,6)} %`)}
        ${line('kcert =','',fmt(s.kCert,3))}
        ${line('u₂ =',`${fmt(s.muCert,6)} / ${fmt(s.kCert,3)} =`,`${fmt(c.u2,7)} %`,'result-line')}
        <p class="note">Default effective DoF treatment in v4: Type B components are taken as v = ∞ unless the laboratory has justified finite DoF information.</p>
      `) +
      step('U3','Reference Standard Resolution','Type B · Rectangular',`
        <div class="formula-box">a = R/2 &nbsp;&nbsp; ; &nbsp;&nbsp; u₃ = a/√3</div>
        ${line('R =','',`${fmt(s.resolution,7)} %`)}
        ${line('a =',`${fmt(s.resolution,7)} / 2 =`,`${fmt(c.semiResolution,8)} %`)}
        ${line('u₃ =',`${fmt(c.semiResolution,8)} / √3 =`,`${fmt(c.u3,8)} %`,'result-line')}
      `) +
      step('U4','Historical Drift of Reference Standard','Type B · Rectangular',`
        <div class="formula-box">u₄ = D / √3</div>
        ${line('Historical drift magnitude, D =','',`${fmt(s.historicalDrift,6)} %`)}
        ${line('u₄ =',`${fmt(s.historicalDrift,6)} / √3 =`,`${fmt(c.u4,7)} %`,'result-line')}
        <p class="note">D is a manually entered laboratory-established historical stability/drift magnitude. It is not the current calibration-certificate error and not the correction factor.</p>
      `) +
      step('U5','Temperature Effect','Type B · Rectangular',`
        <div class="formula-box">ΔEtemp = β × ΔT &nbsp;&nbsp; ; &nbsp;&nbsp; u₅ = ΔEtemp/√3</div>
        ${line('β =','',`${fmt(s.tempCoeff,6)} %/°C`)}
        ${line('ΔT =','',`${fmt(s.deltaTemp,3)} °C`)}
        ${line('ΔEtemp =',`${fmt(s.tempCoeff,6)} × ${fmt(s.deltaTemp,3)} =`,`${fmt(c.tempEffect,7)} %`)}
        ${line('u₅ =',`${fmt(c.tempEffect,7)} / √3 =`,`${fmt(c.u5,7)} %`,'result-line')}
      `) +
      step('Uc','Combined Standard Uncertainty','Root-sum-of-squares',`
        <div class="formula-box">uc = √(u₁² + u₂² + u₃² + u₄² + u₅²)</div>
        ${line('uc =',`√[${uTerms}] =`,`${fmt(c.uc,7)} %`,'result-line')}
        ${line('Σuᵢ² =','',c.sumSquaresU.toExponential(8))}
      `) +
      step('veff','Effective Degrees of Freedom','Welch–Satterthwaite',`
        <div class="formula-box">v_eff = uc⁴ / Σ(uᵢ⁴/vᵢ)</div>
        ${line('Type A finite term =',`${fmt(c.u1,7)}⁴ / ${c.v1} =`,c.wsDen.toExponential(8))}
        ${line('Type B terms =','v = ∞ → contribution to denominator =','0')}
        ${line('v_eff =',c.wsDen>0?`${c.uc.toExponential(7)}⁴ / ${c.wsDen.toExponential(8)} =`:'u₁ = 0 →',Number.isFinite(c.veff)?fmt(c.veff,2):'∞','result-line')}
      `) +
      step('U','Expanded Uncertainty','95% two-sided Student t',`
        <div class="formula-box">U = k × uc</div>
        ${line('v_eff =','',Number.isFinite(c.veff)?fmt(c.veff,2):'∞')}
        ${line('k95 =','',fmt(c.k95,3))}
        ${line('U =',`${fmt(c.uc,7)} × ${fmt(c.k95,3)} =`,`${fmt(c.ue,7)} %`)}
        ${line('U rounded upward to 3 d.p. =','',`${fmt(c.ueRounded,3)} %`,'result-line')}
      `) +
      step('CMC','CMC Reporting Check','Laboratory reporting control',`
        <div class="formula-box">Reported MU = max(Urounded, CMC)</div>
        ${line('Calculated Urounded =','',`${fmt(c.ueRounded,3)} %`)}
        ${line('Laboratory CMC =','',`${fmt(s.cmc,3)} %`)}
        ${line('Reported MU =','',`${fmt(c.reportedMU,3)} %`,'result-line')}
        <p class="note">This v4 validator retains the laboratory CMC floor used in v3. Confirm the reporting rule against the applicable accreditation scope/policy before controlled use.</p>
      `);

    $('steps-container').querySelectorAll('.step-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
  }

  function renderSummary(c, s) {
    $('summary-container').innerHTML = `
      <div class="validation-banner ${c.belowCmc?'warn':'ok'}"><strong>${c.belowCmc?'⚠ Calculated uncertainty is below CMC':'✓ Calculated uncertainty is at/above CMC'}</strong><br><span class="note">Calculated rounded U = ${fmt(c.ueRounded,3)}%, CMC = ${fmt(s.cmc,3)}%, reported value = ${fmt(c.reportedMU,3)}%.</span></div>
      <div class="summary-card"><h3>📊 Measurement Uncertainty Summary</h3>
        <table class="summary-table">
          <tr><td>Average measured error</td><td>${signed(c.avg,5)} %</td></tr>
          <tr><td>Reference standard error</td><td>${signed(s.refStdError,5)} %</td></tr>
          <tr><td>Correction factor (auto)</td><td>${signed(c.correctionFactor,5)} %</td></tr>
          <tr class="major"><td>Corrected mean error</td><td>${signed(c.correctedAvg,5)} %</td></tr>
          <tr><td>u₁ Repeatability</td><td>${fmt(c.u1,6)} %</td></tr>
          <tr><td>u₂ Calibration certificate</td><td>${fmt(c.u2,6)} %</td></tr>
          <tr><td>u₃ Resolution</td><td>${fmt(c.u3,7)} %</td></tr>
          <tr><td>u₄ Historical drift</td><td>${fmt(c.u4,6)} %</td></tr>
          <tr><td>u₅ Temperature</td><td>${fmt(c.u5,6)} %</td></tr>
          <tr class="major"><td>Combined standard uncertainty, uc</td><td>${fmt(c.uc,6)} %</td></tr>
          <tr><td>Effective DoF</td><td>${Number.isFinite(c.veff)?fmt(c.veff,1):'∞'}</td></tr>
          <tr><td>Coverage factor k95</td><td>${fmt(c.k95,3)}</td></tr>
          <tr><td>Expanded uncertainty U</td><td>${fmt(c.ue,6)} %</td></tr>
          <tr><td>U rounded upward (3 d.p.)</td><td>${fmt(c.ueRounded,3)} %</td></tr>
          <tr><td>Laboratory CMC</td><td>${fmt(s.cmc,3)} %</td></tr>
        </table>
        <div class="final-result ${c.belowCmc?'warn':''}">Final reported expanded uncertainty<span class="big">U = ± ${fmt(c.reportedMU,3)} %</span></div>
      </div>`;
  }

  function renderExcel(c, s) {
    const delta = Math.abs(c.reportedMU - s.excelMU);
    const match = delta < 0.0005;
    $('excel-container').innerHTML = `<div class="card-header"><span>📋</span><h3>Excel Comparison / Software Validation</h3></div>
      <div class="compare"><div>MU Validate Pro v4 reported MU</div><div>${fmt(c.reportedMU,3)} %</div><div>Excel reference MU</div><div>${fmt(s.excelMU,3)} %</div><div>Absolute difference</div><div>${fmt(delta,6)} %</div><div>Status</div><div class="${match?'match':'mismatch'}">${match?'✓ MATCH':'⚠ MISMATCH'}</div></div>
      <p class="note">A match only verifies agreement with the entered Excel reference for this case; it does not replace formal software verification/validation and controlled test evidence.</p>`;
  }

  function runCalculation() {
    syncStateFromInputs();
    const errors = validate(state);
    if (errors.length) { showToast(errors[0]); return; }
    const calc = calculate(state);
    renderManual(calc,state); renderSummary(calc,state); renderExcel(calc,state);
    $('results-card').hidden = false; $('summary-card').hidden = false; $('excel-card').hidden = false;
    $('results-card').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function savedProjects() { try { return JSON.parse(localStorage.getItem('mu-projects-v4') || '{}'); } catch (_) { return {}; } }
  function writeProjects(p) { localStorage.setItem('mu-projects-v4', JSON.stringify(p)); }

  $('btn-save').addEventListener('click', () => { syncStateFromInputs(); $('save-project-name').value = state.projectName || state.jobRef || ''; saveModal.classList.add('show'); });
  $('btn-save-cancel').addEventListener('click', () => saveModal.classList.remove('show'));
  $('btn-save-confirm').addEventListener('click', () => {
    const name = $('save-project-name').value.trim(); if (!name) return showToast('Enter a project name');
    syncStateFromInputs(); state.projectName = name; const p = savedProjects(); p[name] = structuredCloneSafe(state); writeProjects(p); saveDraft(); saveModal.classList.remove('show'); showToast('Project saved');
  });

  $('btn-load').addEventListener('click', () => {
    const p = savedProjects(), names = Object.keys(p);
    $('load-project-list').innerHTML = names.length ? names.map(n => `<div class="saved-row"><span>${esc(n)}</span><span><button data-load="${esc(n)}">Load</button> <button data-delete="${esc(n)}">Delete</button></span></div>`).join('') : '<p class="note">No saved projects.</p>';
    $('load-project-list').querySelectorAll('[data-load]').forEach(b => b.addEventListener('click', () => { state = Object.assign(structuredCloneSafe(defaults), p[b.dataset.load]); saveDraft(); loadModal.classList.remove('show'); renderApp(); showToast('Project loaded'); }));
    $('load-project-list').querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => { const q=savedProjects(); delete q[b.dataset.delete]; writeProjects(q); $('btn-load').click(); }));
    loadModal.classList.add('show');
  });
  $('btn-load-cancel').addEventListener('click', () => loadModal.classList.remove('show'));
  $('btn-darkmode').addEventListener('click', () => { currentTheme = currentTheme === 'dark' ? 'light' : 'dark'; applyTheme(); });

  loadDraft(); applyTheme(); renderApp();
  setTimeout(() => { $('splash-screen').classList.add('fade'); $('app-container').hidden = false; }, 1200);
})();
