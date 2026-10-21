/* Petition modal, floating bar, live counter. Wire PLEDGE_ENDPOINT to the backend. */
(function () {
  var CFG = window.UPS_CONFIG || { count: 0 };
  var API = window.UPS_API || '';
  // Goal = next round step, jumping once within 100. Step: 500 <2k, 1,000 <10k, 5,000 <100k, then 25,000.
  function goalFor(n) {
    var step = n < 2000 ? 500 : n < 10000 ? 1000 : n < 100000 ? 5000 : 25000;
    return Math.ceil((n + 101) / step) * step;
  }
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var count = CFG.count, goal = goalFor(count), signed = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var modal = $('#petition-modal'), bar = $('#petition-bar');
  if (!modal) return;
  var pct = function (n) { return Math.min(100, n / goal * 100).toFixed(1) + '%'; };
  var lastFocus;

  function paint() {
    document.querySelectorAll('[data-count]').forEach(function (e) { e.textContent = fmt(count); });
    document.querySelectorAll('[data-goal]').forEach(function (e) { e.textContent = fmt(goal); });
    document.querySelectorAll('[data-pct]').forEach(function (e) { e.style.width = pct(count); });
  }
  function open() {
    lastFocus = document.activeElement;
    modal.classList.add('open'); bar.classList.remove('show');
    document.body.style.overflow = 'hidden';
    var f = $('input', modal); if (f && !signed) f.focus();
  }
  function close() {
    modal.classList.remove('open'); document.body.style.overflow = '';
    if (history.replaceState && location.hash === '#sign') history.replaceState(null, '', location.pathname + location.search);
    onScroll(); if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-petition]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  $('.modal-x', modal).addEventListener('click', close);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  addEventListener('hashchange', function () { if (location.hash === '#sign') open(); });

  function onScroll() { bar.classList.toggle('show', scrollY > innerHeight * 0.7 && !modal.classList.contains('open')); }
  addEventListener('scroll', onScroll, { passive: true });

  // counter animation (Join card)
  var shown = 0, counted = false;
  var shownEl = $('[data-shown]'), shownBar = $('[data-shown-pct]');
  function paintShown() { if (shownEl) shownEl.textContent = fmt(shown); if (shownBar) shownBar.style.width = pct(shown); }
  function runCounter() {
    if (counted) return; counted = true;
    var to = count, t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 2200); shown = Math.round(to * (1 - Math.pow(1 - p, 4))); paintShown();
      if (p < 1) requestAnimationFrame(step); else { shown = count; paintShown(); }
    })(t0);
  }
  if (window.UPS) { UPS.onReveal.counter = runCounter; }
  if (!window.UPS || UPS.reduced) { shown = count; counted = true; }
  paintShown(); paint();
  function setCount(n) {
    if (typeof n !== 'number' || n < count && signed) return;
    count = n; goal = goalFor(count); if (counted) shown = count; paint(); paintShown();
  }
  if (API) fetch(API).then(function (r) { return r.json(); }).then(function (d) { if (d && d.ok) setCount(d.count); }).catch(function () {});

  // submit
  var form = $('form', modal), errEl = $('.err', modal);
  var url = 'https://utahpublicski.org';
  var msg = 'I just signed the Powder Petition for a public, resident-first ski area in Utah. Sign it too: ' + url;
  $('.sms-btn', modal).href = 'sms:?&body=' + encodeURIComponent(msg);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form), name = (d.get('name') || '').trim(), email = (d.get('email') || '').trim(), zip = (d.get('zip') || '').trim();
    var bad = [];
    if (!name) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
    if (!/^\d{5}(-\d{4})?$/.test(zip)) bad.push('zip');
    form.querySelectorAll('input').forEach(function (i) { i.removeAttribute('aria-invalid'); });
    bad.forEach(function (n) { form.elements[n].setAttribute('aria-invalid', 'true'); });
    if (bad.length) { errEl.textContent = 'Please check your ' + bad.join(', ') + '.'; errEl.hidden = false; form.elements[bad[0]].focus(); return; }
    errEl.hidden = true;
    var btn = $('.submit', form); btn.disabled = true;
    var payload = { type: 'pledge', name: name, email: email, zip: zip, consent: true };
    var done = function () {
      count += 1; goal = goalFor(count); if (counted) shown = count; paint(); paintShown(); signed = true;
      $('.signed-n', modal).textContent = fmt(count);
      $('.state-form', modal).hidden = true; $('.state-done', modal).hidden = false;
      $('.bar-btn-label .long').textContent = 'Signed ✓'; $('.bar-btn-label .short').textContent = 'Signed ✓';
      btn.disabled = false;
    };
    if (!API) { done(); return; }
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (d) { done(); if (d && d.ok && typeof d.count === 'number') { setCount(d.count); $('.signed-n', modal).textContent = fmt(count); } })
      .catch(done);
  });
  var shareBtn = $('.share-btn', modal);
  shareBtn.addEventListener('click', function () {
    var copyFallback = function () {
      (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).catch(function () {}).then(function () {
        shareBtn.textContent = 'Link copied'; setTimeout(function () { shareBtn.textContent = 'Share with a friend'; }, 2000);
      });
    };
    if (navigator.share) navigator.share({ title: 'Utah Public Ski', text: msg, url: url }).catch(function () {}); else copyFallback();
  });

  if (location.hash === '#sign') open();
})();
