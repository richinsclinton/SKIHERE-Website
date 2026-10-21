(function () {
  var form = document.getElementById('contact-form'), done = document.getElementById('contact-done');
  var err = form.querySelector('.err'), topic = 'General question';
  var ENDPOINT = window.UPS_API || '';
  form.querySelectorAll('.topic').forEach(function (b) {
    b.addEventListener('click', function () {
      form.querySelectorAll('.topic').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      topic = b.textContent;
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, bad = [];
    var name = f.name.value.trim(), email = f.email.value.trim(), message = f.message.value.trim();
    if (!name) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push('email');
    if (!message) bad.push('message');
    ['name', 'email', 'message'].forEach(function (n) { f[n].removeAttribute('aria-invalid'); });
    bad.forEach(function (n) { f[n].setAttribute('aria-invalid', 'true'); });
    if (bad.length) { err.textContent = 'Please check your ' + bad.join(', ') + '.'; err.hidden = false; f[bad[0]].focus(); return; }
    err.hidden = true;
    (ENDPOINT ? fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ type: 'contact', topic: topic, name: name, email: email, message: message }) }) : Promise.resolve())
      .catch(function () {})
      .then(function () { form.hidden = true; done.hidden = false; });
  });
  document.getElementById('again').addEventListener('click', function () { form.reset(); done.hidden = true; form.hidden = false; });
})();
