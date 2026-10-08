/* ── EMBLEM INLINE SVG (replaces external image) ──────────────────────────── */
/* We generate the emblem programmatically via JS */

// ──────────────────────────────────────────────────────────────────────────────
// TAB NAVIGATION
// ──────────────────────────────────────────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + target).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// EMBLEM — Draw India Government Emblem as simple SVG inline
// ──────────────────────────────────────────────────────────────────────────────
const emblemImg = document.getElementById('emblem-img');
if (emblemImg) {
  // Replace the img tag with an inline SVG approximation
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '80');
  svg.setAttribute('height', '80');
  svg.setAttribute('viewBox', '0 0 80 80');
  svg.setAttribute('class', 'emblem');
  svg.innerHTML = `
    <circle cx="40" cy="28" r="22" fill="none" stroke="white" stroke-width="2.5"/>
    <circle cx="40" cy="28" r="16" fill="none" stroke="white" stroke-width="1.5"/>
    <circle cx="40" cy="28" r="6" fill="white"/>
    <!-- Spokes of Ashoka Chakra (simplified) -->
    ${Array.from({length:24}, (_, i) => {
      const angle = (i * 15 - 90) * Math.PI / 180;
      const x1 = 40 + 7 * Math.cos(angle);
      const y1 = 28 + 7 * Math.sin(angle);
      const x2 = 40 + 14 * Math.cos(angle);
      const y2 = 28 + 14 * Math.sin(angle);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="white" stroke-width="1"/>`;
    }).join('')}
    <!-- Lions (schematic) -->
    <ellipse cx="28" cy="50" rx="7" ry="9" fill="white" opacity="0.9"/>
    <ellipse cx="40" cy="48" rx="7" ry="10" fill="white"/>
    <ellipse cx="52" cy="50" rx="7" ry="9" fill="white" opacity="0.9"/>
    <!-- Base text -->
    <text x="40" y="70" text-anchor="middle" font-size="7" fill="white" font-family="serif" letter-spacing="1">सत्यमेव जयते</text>
    <line x1="16" y1="73" x2="64" y2="73" stroke="white" stroke-width="1"/>
  `;
  emblemImg.parentNode.replaceChild(svg, emblemImg);
}

// ──────────────────────────────────────────────────────────────────────────────
// ELIGIBILITY CHECKER
// ──────────────────────────────────────────────────────────────────────────────
const checkBtn = document.getElementById('check-btn');
if (checkBtn) {
  checkBtn.addEventListener('click', runEligibilityCheck);
}

function runEligibilityCheck() {
  const age = parseInt(document.getElementById('age-input').value);
  const cat = document.getElementById('cat-select').value;
  const ecl = document.getElementById('ecl-select').value;
  const qual = document.getElementById('qual-select').value;
  const domicile = document.getElementById('domicile-select').value;
  const result = document.getElementById('eligibility-result');

  result.classList.remove('hidden', 'eligible', 'ineligible', 'partial');

  // Validate inputs
  if (!age || !cat || !qual) {
    result.className = 'eligibility-result partial';
    result.innerHTML = '<strong>⚠ Please fill in all required fields before checking.</strong>';
    return;
  }

  const issues = [];
  const positives = [];
  const notes = [];

  // Age limit logic (UR: 35, PwD: 45)
  const ageLimits = { UR: 35, PwD: 45 };
  let effectiveAgeLimit = ageLimits[cat] || 35;
  let eclBonus = false;

  if (ecl === 'yes') {
    effectiveAgeLimit = Math.max(effectiveAgeLimit, 48);
    eclBonus = true;
    positives.push(`✅ ECL status: age limit extended to <strong>48 years</strong> (Clause 7.3).`);
    positives.push(`✅ ECL status: <strong>application fee waived (₹0)</strong> (Clause 7.5).`);
    positives.push(`✅ ECL status: you are eligible for the <strong>8-post reserved ECL quota</strong> (Clause 7.2).`);
  }

  if (age < 18) {
    issues.push(`❌ You must be at least <strong>18 years old</strong>. You are ${age}.`);
  } else if (age > effectiveAgeLimit) {
    issues.push(`❌ You are <strong>${age} years old</strong>. The maximum age limit for ${cat}${eclBonus ? ' + ECL' : ''} is <strong>${effectiveAgeLimit} years</strong>.`);
  } else {
    positives.push(`✅ Age: <strong>${age} years</strong> is within the limit of ${effectiveAgeLimit} years for ${cat}${eclBonus ? ' + ECL' : ''}.`);
  }

  // Qualification logic for Mine-Void Solar Installation Technician
  const qualScores = {
    'below10': 0, '10th': 1, '12th': 2, 'solar_cert': 3, 'iti': 4, 'diploma': 5, 'degree': 6
  };
  const score = qualScores[qual] || 0;

  if (score >= 3) {
    positives.push(`✅ Qualification meets statutory criteria for solar technician deployment.`);
  } else if (score === 2 && ecl === 'yes') {
    notes.push(`📋 As an ECL candidate with 10+2 Science, you are eligible for the <strong>6-month Fast-Track Mine-Solar Transition Programme</strong> with ₹14,000/mo stipend at the CSERC Solar Skills Centre, Gevra (Clause 7.4).`);
  } else if (ecl === 'yes') {
    notes.push(`📋 As an ECL candidate, prior mine-electrical experience is credited at 50% for practical evaluation (Clause 7.6). You may enrol in the residential Fast-Track training prior to final appointment.`);
  } else {
    issues.push(`❌ Minimum qualification required is an ITI Certificate in Solar/Electrician trade, Solar PV Certificate, or Diploma in Electrical Engineering.`);
  }

  // Domicile
  if (domicile === 'korba') {
    positives.push(`✅ Domicile: Korba district — mine-void priority zone.`);
  } else if (domicile === 'cg') {
    positives.push(`✅ Domicile: Chhattisgarh state resident.`);
  } else {
    notes.push(`📋 Outside Chhattisgarh: candidates must demonstrate working knowledge of Hindi / Chhattisgarhi.`);
  }

  // Build output
  let html = '';
  const hasBlocker = issues.some(i => i.startsWith('❌'));

  if (hasBlocker) {
    result.classList.add('ineligible');
    html += `<h3 style="margin-bottom:12px; color:#f87171;">❌ Not Currently Eligible</h3>`;
  } else if (notes.length > 0 && issues.length === 0) {
    result.classList.add('partial');
    html += `<h3 style="margin-bottom:12px; color:#fde047;">⚠️ Conditionally Eligible (Fast-Track Training Required)</h3>`;
  } else {
    result.classList.add('eligible');
    html += `<h3 style="margin-bottom:12px; color:#86efac;">✅ Fully Eligible to Apply</h3>`;
  }

  if (positives.length) {
    html += positives.map(p => `<p style="margin-bottom:6px;">${p}</p>`).join('');
  }
  if (issues.length) {
    html += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.15);">`;
    html += issues.map(i => `<p style="margin-bottom:6px;">${i}</p>`).join('');
    html += `</div>`;
  }
  if (notes.length) {
    html += `<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.15); font-style:italic;">`;
    html += notes.map(n => `<p style="margin-bottom:6px;">${n}</p>`).join('');
    html += `</div>`;
  }

  // Fee calculation (UR: ₹350, ECL: Nil, PwD: Nil)
  let fee = '₹ 350 (UR Open Merit)';
  if (ecl === 'yes') fee = '₹ 0 (Nil — ECL Ex-Coal Worker Waiver)';
  else if (cat === 'PwD') fee = '₹ 0 (Nil — PwD Exemption)';

  html += `<div style="margin-top:14px; padding:12px 16px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); border-radius:4px; font-size:13.5px; color:#fff;">
    <strong>Applicable Application Fee:</strong> ${fee}
  </div>`;

  result.innerHTML = html;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ──────────────────────────────────────────────────────────────────────────────
// APPLICATION FORM — Dynamic ECL section + fee update
// ──────────────────────────────────────────────────────────────────────────────
const eclYes = document.getElementById('ecl-yes');
const eclNo = document.getElementById('ecl-no');
const eclDetails = document.getElementById('ecl-details');
const feeAmount = document.getElementById('fee-amount');
const formCat = document.getElementById('form-cat');

function updateFeeDisplay() {
  if (!feeAmount || !formCat) return;
  const cat = formCat.value;
  const isEcl = eclYes && eclYes.checked;

  if (isEcl) {
    feeAmount.textContent = '₹ 0 (Nil — ECL Waiver under Clause 7.5)';
    return;
  }
  const fees = { UR: '₹ 350 (UR Open Merit)', PwD: '₹ 0 (Nil — PwD Exemption)' };
  feeAmount.textContent = fees[cat] || '₹ 350';
}

if (eclYes) {
  eclYes.addEventListener('change', () => {
    eclDetails.classList.remove('hidden');
    updateFeeDisplay();
  });
}
if (eclNo) {
  eclNo.addEventListener('change', () => {
    eclDetails.classList.add('hidden');
    updateFeeDisplay();
  });
}
if (formCat) formCat.addEventListener('change', updateFeeDisplay);

// ──────────────────────────────────────────────────────────────────────────────
// APPLICATION FORM SUBMISSION
// ──────────────────────────────────────────────────────────────────────────────
const appForm = document.getElementById('app-form');
if (appForm) {
  appForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const agree = document.getElementById('agree-check');
    const name = document.getElementById('full-name');
    const submitResult = document.getElementById('submit-result');

    if (!agree || !agree.checked) {
      alert('Please read and agree to the declaration before submitting.');
      return;
    }
    if (!name || !name.value.trim()) {
      alert('Please enter your full name.');
      return;
    }
    const jobSel = document.getElementById('job-select');
    if (!jobSel || !jobSel.value) {
      alert('Please select the post you are applying for.');
      jobSel && jobSel.focus();
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting to Registry…';

    // Simulate submission
    setTimeout(() => {
      const refNum = 'CSMVSA/KRB/2050/' + Math.random().toString(36).substr(2,9).toUpperCase();
      submitResult.classList.remove('hidden');
      submitResult.innerHTML = `
        <h3 style="color:#86efac; margin-bottom:10px; text-shadow:0 0 10px rgba(16,185,129,0.5);">✅ Application Lodged into National Solar Asset Registry</h3>
        <p><strong>Acknowledgement Number:</strong> <code style="font-family:monospace; background:rgba(16,185,129,0.25); color:#a7f3d0; padding:3px 10px; border-radius:4px; border:1px solid #10b981;">${refNum}</code></p>
        <p style="margin-top:10px;"><strong>Applicant:</strong> ${escapeHtml(name.value.trim())}</p>
        <p style="margin-top:6px;"><strong>Post Applied For:</strong> ${JOB_DETAILS[document.getElementById('job-select').value].t}</p>
        <p style="margin-top:6px; color:#cbd5e1;">A confirmation SMS and Digilocker verification token have been dispatched to your linked mobile number.</p>
        <p style="margin-top:10px; font-size:13px; color:#94a3b8;">Practical Assessment at Gevra Mine-Void Solar Training Ground scheduled for December 2050. Download your telemetry slip before 15 November 2050.</p>
        <hr style="margin:14px 0; border-color:rgba(16,185,129,0.3);"/>
        <p style="font-size:12px; color:#94a3b8;">Speculative design artefact for academic / policy deliberation. No real submission occurred.</p>
      `;
      submitResult.scrollIntoView({ behavior: 'smooth' });
      submitBtn.textContent = 'Application Registered';
    }, 1600);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ──────────────────────────────────────────────────────────────────────────────
// ANIMATE BAR CHART when pay tab is first viewed
// ──────────────────────────────────────────────────────────────────────────────
let payAnimated = false;
const payTabBtn = document.querySelector('[data-tab="payscale"]');
if (payTabBtn) {
  payTabBtn.addEventListener('click', () => {
    if (!payAnimated) {
      payAnimated = true;
      const bars = document.querySelectorAll('.bar-fill');
      bars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = targetWidth; }, 100);
      });
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// AADHAAR FORMAT
// ──────────────────────────────────────────────────────────────────────────────
const aadhaarInput = document.getElementById('aadhaar');
if (aadhaarInput) {
  aadhaarInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 12);
    e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// NOTICE BAR TICKER — cycle through notices
// ──────────────────────────────────────────────────────────────────────────────
const notices = [
  'Advertisement No. CSMVSA/KRB/2050/12 | Last Date: 31 October 2050 | Application Fee Waived for Ex-Coal Sector Workers',
  'Field Assessment Venue: Gevra Mine-Void Solar Training Ground | December 2050',
  'Fast-Track Transition Programme (Clause 7.4): Applications open concurrently at CSERC Solar Skills Centre, Gevra',
  'ECL Verification Desk: District Labour Office, Korba — Biometric Helpline: 07759-XXXXXX',
];
let noticeIdx = 0;
const noticeBar = document.querySelector('.notice-bar');
if (noticeBar) {
  setInterval(() => {
    noticeIdx = (noticeIdx + 1) % notices.length;
    noticeBar.style.opacity = '0';
    noticeBar.style.transition = 'opacity 0.4s';
    setTimeout(() => {
      noticeBar.innerHTML = `<span class="blink">☀ IMPORTANT NOTICE</span> &nbsp; ${notices[noticeIdx]}`;
      noticeBar.style.opacity = '1';
    }, 420);
  }, 5000);
}

// ──────────────────────────────────────────────────────────────────────────────
// SCROLL ANIMATION ENGINE
// ──────────────────────────────────────────────────────────────────────────────

/* 1. Progress bar + scroll-to-top button */
const progressBar = document.createElement('div');
progressBar.id = 'read-progress';
document.body.prepend(progressBar);

const scrollTopBtn = document.createElement('button');
scrollTopBtn.id = 'scroll-top-btn';
scrollTopBtn.title = 'Back to top';
scrollTopBtn.innerHTML = '↑';
document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' })
);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  scrolled > 320
    ? scrollTopBtn.classList.add('visible')
    : scrollTopBtn.classList.remove('visible');
}, { passive: true });

/* 2. Animation config map */
const ANIM_MAP = [
  { sel: '.newspaper-page',              cls: 'anim-fade-up',      stagger: false },
  { sel: '.ad-headline-block',           cls: 'anim-stamp',        stagger: false },
  { sel: '.priority-tag',                cls: 'anim-scale-in',     stagger: false },
  { sel: '.ad-section',                  cls: 'anim-fade-up',      stagger: true  },
  { sel: '.section-heading',             cls: 'anim-heading-done', stagger: false },
  { sel: '.res-card',                    cls: 'anim-stamp',        stagger: true  },
  { sel: '.elig-item',                   cls: 'anim-fade-right',   stagger: true  },
  { sel: '.step',                        cls: 'anim-fade-right',   stagger: true  },
  { sel: '.tool-card',                   cls: 'anim-fade-up',      stagger: false },
  { sel: '.pay-table tbody tr',          cls: 'anim-fade-right',   stagger: true  },
  { sel: '.bar-item',                    cls: 'anim-fade-right',   stagger: true  },
  { sel: '.pay-verdict',                 cls: 'anim-fade-up',      stagger: false },
  { sel: '.clause-box',                  cls: 'anim-fade-up',      stagger: false },
  { sel: '.analysis-card',              cls: 'anim-scale-in',     stagger: true  },
  { sel: '.context-stat-card',           cls: 'anim-scale-in',     stagger: true  },
  { sel: '.tl-item',                     cls: 'anim-flip-in',      stagger: true  },
  { sel: 'fieldset',                     cls: 'anim-slide-up',     stagger: true  },
  { sel: '.footnote-section blockquote', cls: 'anim-fade-right',   stagger: false },
  { sel: '.footnote-section p',          cls: 'anim-fade-up',      stagger: true  },
  { sel: '.context-note',                cls: 'anim-fade-right',   stagger: false },
];

const DELAY_CLASSES = [
  'anim-delay-1','anim-delay-2','anim-delay-3','anim-delay-4',
  'anim-delay-5','anim-delay-6','anim-delay-7','anim-delay-8',
];
const ALL_ANIM_CLASSES = [
  'anim-fade-up','anim-fade-down','anim-fade-left','anim-fade-right',
  'anim-scale-in','anim-flip-in','anim-slide-up','anim-stamp',
  'anim-dot','anim-heading-done', ...DELAY_CLASSES,
];

/* 3. Mark elements as hidden */
function prepareAnimations(root = document) {
  ANIM_MAP.forEach(({ sel }) => {
    root.querySelectorAll(sel).forEach(el => {
      if (!el.dataset.animReady) {
        el.classList.add('anim-hidden');
        el.dataset.animReady = '1';
      }
    });
  });
}

/* 4. Observer */
function buildObserver() {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const animCls = el.dataset.animCls;
      if (!animCls) return;
      el.classList.remove('anim-hidden');
      el.classList.add(animCls);
      if (el.classList.contains('res-num')) animateCount(el);
      if (el.classList.contains('stat-value')) animateStatText(el);
      scrollObs.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
}

let scrollObs = buildObserver();

/* 5. Register elements with observer */
function registerAnimations(root = document) {
  const staggerGroups = new Map();

  ANIM_MAP.forEach(({ sel, cls, stagger }) => {
    root.querySelectorAll(sel).forEach(el => {
      if (el.dataset.animRegistered) return;
      el.dataset.animCls = cls;
      el.dataset.animRegistered = '1';
      if (stagger) {
        const key = el.parentElement;
        if (!staggerGroups.has(key)) staggerGroups.set(key, []);
        staggerGroups.get(key).push(el);
      }
      scrollObs.observe(el);
    });
  });

  staggerGroups.forEach(siblings => {
    siblings.forEach((el, i) => el.classList.add(DELAY_CLASSES[i % DELAY_CLASSES.length]));
  });

  root.querySelectorAll('.tl-dot').forEach((dot, idx) => {
    if (dot.dataset.animRegistered) return;
    dot.classList.add('anim-hidden');
    dot.dataset.animCls = 'anim-dot';
    dot.dataset.animRegistered = '1';
    if (idx % 2 === 1) dot.classList.add('anim-delay-1');
    scrollObs.observe(dot);
  });

  root.querySelectorAll('.stat-value').forEach(el => {
    if (el.dataset.animRegistered) return;
    el.classList.add('anim-hidden');
    el.dataset.animCls = 'anim-scale-in';
    el.dataset.animRegistered = '1';
    scrollObs.observe(el);
  });
}

/* 6. Count-up for reservation numbers */
function animateCount(el) {
  const target = parseInt(el.textContent.replace(/\D/g,''), 10);
  if (isNaN(target) || target > 200) return;
  const hasStar = el.textContent.includes('*');
  el.classList.add('counting');
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 18));
  const iv = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (hasStar ? '*' : '');
    if (cur >= target) { clearInterval(iv); el.classList.remove('counting'); }
  }, 45);
}

/* 7. Stat text count-up */
function animateStatText(el) {
  const original = el.textContent.trim();
  const match = original.match(/^~?([\d,]+)/);
  if (!match) return;
  const raw = parseInt(match[1].replace(/,/g,''), 10);
  if (isNaN(raw) || raw > 9_999_999) return;
  const prefix = original.startsWith('~') ? '~' : '';
  const suffix = original.slice(match[0].length);
  let frame = 0; const steps = 28;
  const iv = setInterval(() => {
    frame++;
    const ease = 1 - Math.pow(1 - frame / steps, 3);
    el.textContent = prefix + Math.round(ease * raw).toLocaleString('en-IN') + suffix;
    if (frame >= steps) { clearInterval(iv); el.textContent = original; }
  }, 28);
}

/* 8. Re-animate elements when switching tabs */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(() => {
      const active = document.querySelector('.tab-content.active');
      if (!active) return;
      active.querySelectorAll('[data-anim-registered]').forEach(el => {
        delete el.dataset.animRegistered;
        delete el.dataset.animReady;
        el.classList.remove(...ALL_ANIM_CLASSES);
        el.classList.add('anim-hidden');
      });
      prepareAnimations(active);
      registerAnimations(active);
    }, 60);
  });
});

/* 9. Parallax on header emblem */
window.addEventListener('scroll', () => {
  const emb = document.querySelector('.emblem');
  if (emb) {
    const y = window.scrollY * 0.22;
    emb.style.transform = `translateY(${y}px)`;
  }
}, { passive: true });

/* 10. 3-D tilt on reservation cards */
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.res-card').forEach(card => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 1.2) {
      card.style.transform =
        `perspective(380px) rotateX(${-dy*9}deg) rotateY(${dx*9}deg) translateY(-5px) scale(1.03)`;
      card.style.transition = 'none';
    }
  });
});
document.addEventListener('mouseleave', () => {
  document.querySelectorAll('.res-card').forEach(c => {
    c.style.transform = '';
    c.style.transition = '';
  });
});

/* 11. Init */
prepareAnimations();
registerAnimations();

// ──────────────────────────────────────────────────────────────────────────────
// 12. SCROLL-DRIVEN BACKGROUND CROSSFADE (image 1 → image 2)
// ──────────────────────────────────────────────────────────────────────────────
const bgLayer1 = document.getElementById('solar-layer');
const bgLayer2 = document.getElementById('solar-layer-2');
if (bgLayer1 && bgLayer2) {
  const updateBgFade = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    // smoothstep for a gentle blend
    const t = p * p * (3 - 2 * p);
    bgLayer1.style.opacity = (1 - t).toFixed(3);
    bgLayer2.style.opacity = t.toFixed(3);
  };
  window.addEventListener('scroll', updateBgFade, { passive: true });
  window.addEventListener('resize', updateBgFade);
  // tab switches change page height — recompute
  document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => setTimeout(updateBgFade, 60)));
  updateBgFade();
}

// ──────────────────────────────────────────────────────────────────────────────
// 13. APPLY FORM — POST SELECTOR
// ──────────────────────────────────────────────────────────────────────────────
const JOB_DETAILS = {
  install:   { t: 'Panel Installation & Racking', d: 'Assemble and mount monocrystalline PV modules on stabilised overburden benches; follow IS 17001:2048 ground-load tolerances. Frequency: daily on active stretches.' },
  wiring:    { t: 'Electrical Wiring & Inverter Connection', d: 'Connect string cables, DC combiner boxes and AC inverters; insulation-resistance testing before energisation; log records in NSAR. Frequency: daily.' },
  monitor:   { t: 'Performance Monitoring', d: 'Read inverter dashboards and irradiance meters; flag panels below 85% of rated output; report soiling. Frequency: daily.' },
  cleaning:  { t: 'Panel Cleaning & Dust Management', d: 'Operate robotic cleaners on flat arrays and manual deionised-water cleaning on terraced benches. High-priority duty. Frequency: twice weekly.' },
  stability: { t: 'Ground Stability Patrol', d: 'Inspect zones for subsidence cracks, slope erosion and drainage blockage; red-flag deformation above 15 mm. Frequency: weekly.' },
  community: { t: 'Community Boundary Interface', d: 'Maintain the public exclusion zone and respond to gram panchayat queries on dust, noise and visual access. Frequency: as required.' },
};
const jobSelect = document.getElementById('job-select');
const jobInfo = document.getElementById('job-info');
if (jobSelect && jobInfo) {
  jobSelect.addEventListener('change', () => {
    const d = JOB_DETAILS[jobSelect.value];
    if (!d) { jobInfo.classList.add('hidden'); jobInfo.innerHTML = ''; return; }
    jobInfo.innerHTML = `<strong>${d.t}</strong><br>${d.d}`;
    jobInfo.classList.remove('hidden');
  });
}
