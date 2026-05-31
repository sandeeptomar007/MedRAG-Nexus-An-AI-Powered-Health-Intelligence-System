// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  const link = document.querySelector(`button[data-page="${pageId}"]`);
  if (link) link.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'stats') setTimeout(initCharts, 120);
}

function scrollToPredictor() {
  showPage('home');
  setTimeout(() => document.getElementById('predictor').scrollIntoView({ behavior: 'smooth' }), 80);
}

// ── Symptom Analysis ──────────────────────────────────────────────────────────
const BACKEND_URL = 'http://127.0.0.1:8000';

async function analyzeSymptoms() {
  const symptom  = document.getElementById('symptomInput').value.trim();
  const duration = document.getElementById('duration').value;
  const btn      = document.getElementById('analyzeBtn');
  const result   = document.getElementById('result-container');

  if (!symptom) {
    result.innerHTML = `<div class="result-error">⚠️ Please describe your symptoms before analyzing.</div>`;
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;margin:0"></span> Analyzing…`;

  result.innerHTML = `
    <div class="result-loading">
      <div class="spinner"></div>
      <p>Searching medical knowledge base…</p>
    </div>`;

  try {
    const res = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom, duration })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${res.status}`);
    }

    const data = await res.json();
    renderResult(data.response);

  } catch (err) {
    result.innerHTML = `
      <div class="result-error">
        <strong>Could not connect to the backend.</strong><br>
        Make sure the Python server is running on <code>http://127.0.0.1:8000</code>.<br>
        <small style="opacity:.7;margin-top:6px;display:block">${err.message}</small>
      </div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> Analyze Symptoms`;
  }
}

function renderResult(text) {
  const result = document.getElementById('result-container');

  // Separate the disclaimer (appended by backend) from the main answer
  const disclaimerMarker = '⚠️ Disclaimer:';
  let mainText = text;
  let disclaimer = '';

  const idx = text.indexOf(disclaimerMarker);
  if (idx !== -1) {
    mainText   = text.slice(0, idx).trim();
    disclaimer = text.slice(idx).trim();
  }

  // Convert plain-text line breaks to paragraphs
  const paragraphs = mainText
    .split(/\n+/)
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<p>${l}</p>`)
    .join('');

  const disclaimerHtml = disclaimer
    ? `<div class="disclaimer-box">${disclaimer}</div>`
    : '';

  result.innerHTML = `
    <div class="result-content">
      ${paragraphs}
      ${disclaimerHtml}
    </div>`;
}

// ── Charts ────────────────────────────────────────────────────────────────────
let chartsInit = false;

function initCharts() {
  if (chartsInit) return;
  chartsInit = true;

  // COVID trend line
  const covidCtx = document.getElementById('covidChart').getContext('2d');
  new Chart(covidCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Cases (M)',
        data: [500, 550, 600, 580, 620, 650],
        borderColor: '#2d6a4f',
        backgroundColor: 'rgba(45,106,79,0.08)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#2d6a4f',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' } }
      }
    }
  });

  // Disease distribution donut
  const diseaseCtx = document.getElementById('diseaseChart').getContext('2d');
  new Chart(diseaseCtx, {
    type: 'doughnut',
    data: {
      labels: ['Respiratory', 'Cardiovascular', 'Infectious', 'Mental Health', 'Other'],
      datasets: [{
        data: [35, 25, 20, 15, 5],
        backgroundColor: ['#2d6a4f', '#1e4d8c', '#c9531a', '#7c3aed', '#b5820a'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } }
    }
  });

  startKpiUpdates();
}

function startKpiUpdates() {
  function update() {
    const total     = 650000000 + Math.floor(Math.random() * 1000);
    const recovered = 630000000 + Math.floor(Math.random() * 1000);
    const active    = total - recovered;
    document.getElementById('totalCases').textContent   = (total / 1e6).toFixed(1) + 'M+';
    document.getElementById('recovered').textContent    = (recovered / 1e6).toFixed(1) + 'M+';
    document.getElementById('activeCases').textContent  = (active / 1e6).toFixed(1) + 'M+';
  }
  update();
  setInterval(update, 5000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});
