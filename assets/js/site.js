/* Shared motion: hero entrance, Ken Burns, parallax, scroll reveal, bars, chart draw. */
(function () {
  var E = 'cubic-bezier(.16,.84,.24,1)';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  window.UPS = { reduced: reduced, ease: E, $$: $$, onReveal: {} };
  if (reduced) return;

  $$('[data-hero-line]').forEach(function (el, i) { el.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 1300, delay: 150 + i * 150, easing: E, fill: 'backwards' }); });
  $$('[data-hero-fade]').forEach(function (el, i) { el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 700 + i * 140, easing: E, fill: 'backwards' }); });
  var kb = document.querySelector('[data-kenburns]');
  if (kb) kb.animate([{ transform: 'scale(1.16)' }, { transform: 'scale(1.02)' }], { duration: 18000, easing: 'cubic-bezier(.2,.6,.2,1)', fill: 'forwards' });
  var fl = document.querySelector('[data-float]');
  if (fl) fl.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 6500, iterations: Infinity, easing: 'ease-in-out' });

  var vh = innerHeight;
  var targets = $$('[data-reveal],[data-draw],[data-bar],[data-counter]');
  function play(el) {
    var delay = +(el.dataset.delay || 0);
    // Apply the final state first so a failed animation can never leave content hidden.
    var run = function (fn) { try { fn(); } catch (e) {} };
    if (el.hasAttribute('data-reveal')) { el.style.opacity = ''; run(function () { el.animate([{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: delay, easing: E, fill: 'backwards' }); }); }
    if (el.hasAttribute('data-draw')) {
      // CSS transition instead of WAAPI: reliable for SVG stroke-dashoffset on mobile Safari.
      el.style.transition = 'stroke-dashoffset 1800ms cubic-bezier(.45,.05,.2,1) 250ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.strokeDashoffset = 0; }); });
    }
    if (el.hasAttribute('data-bar')) { el.style.transform = ''; run(function () { el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1400, delay: 300, easing: E, fill: 'backwards' }); }); }
    if (el.hasAttribute('data-counter') && UPS.onReveal.counter) UPS.onReveal.counter();
  }
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      if (en.target.tagName.toLowerCase() === 'svg') en.target.querySelectorAll('[data-draw]').forEach(play); else play(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) {
    var below = el.getBoundingClientRect().top > vh * 0.92;
    if (el.hasAttribute('data-draw')) { var L = el.getTotalLength(); el.style.strokeDasharray = L; el.style.strokeDashoffset = below ? L : 0; el._L = L; }
    if (!below) { if (el.hasAttribute('data-counter') && UPS.onReveal.counter) UPS.onReveal.counter(); return; }
    if (el.hasAttribute('data-reveal')) el.style.opacity = '0';
    if (el.hasAttribute('data-bar')) el.style.transform = 'scaleX(0)';
    io.observe(el.hasAttribute('data-draw') ? el.ownerSVGElement : el);
  });

  var pEls = $$('[data-parallax]'), raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var h = innerHeight;
      pEls.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > h + 200) return;
        el.style.transform = 'translate3d(0,' + (-(r.top + r.height / 2 - h / 2) * +el.dataset.parallax).toFixed(1) + 'px,0)';
      });
    });
  }
  if (pEls.length) { addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
})();
