(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  items.forEach(function (it) {
    var q = it.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var was = it.classList.contains('open');
      items.forEach(function (o) { o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      if (!was) { it.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });
})();
