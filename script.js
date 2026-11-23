(function () {
  // Sanftes Einblenden beim Scrollen
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Handy-Menü nach dem Antippen schliessen
  var check = document.getElementById('nav-check');
  if (check) {
    document.querySelectorAll('nav.main a').forEach(function (a) {
      a.addEventListener('click', function () { check.checked = false; });
    });
  }

  // Knöpfe «Schnupperstunde» / «Show buchen» wählen das Anliegen vor
  var anliegen = document.getElementById('anliegen');
  document.querySelectorAll('[data-anliegen]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (!anliegen) return;
      anliegen.value = a.dataset.anliegen === 'show' ? 'Show buchen' : 'Schnuppern';
    });
  });

  // Kontaktformular: öffnet das E-Mail-Programm mit fertigem Text
  var form = document.getElementById('kontakt-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var betreff = 'Anfrage: ' + f.get('Anliegen');
      var text = 'Name: ' + f.get('Name') + '\n' +
        'Erreichbar unter: ' + f.get('Erreichbar unter') + '\n' +
        'Anliegen: ' + f.get('Anliegen') + '\n\n' + (f.get('Nachricht') || '');
      window.location.href = 'mailto:toeandheel@gmx.ch?subject=' +
        encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text);
    });
  }

  // Galerie: Bild in gross mit Blättern, Tastatur und Wischen
  var box = document.getElementById('lightbox');
  if (!box || !box.showModal) return;
  var img = document.getElementById('lb-img');
  var count = document.getElementById('lb-count');
  var list = [];
  var pos = 0;

  function show(i) {
    pos = (i + list.length) % list.length;
    img.src = list[pos].dataset.full;
    img.alt = list[pos].querySelector('img').alt;
    count.textContent = (pos + 1) + ' / ' + list.length;
  }

  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var buttons = Array.prototype.slice.call(g.querySelectorAll('button'));
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () {
        list = buttons;
        show(i);
        box.showModal();
      });
    });
  });

  box.querySelector('.lb-close').addEventListener('click', function () { box.close(); });
  box.querySelector('.lb-prev').addEventListener('click', function () { show(pos - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(pos + 1); });
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lb-inner')) box.close();
  });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(pos - 1);
    if (e.key === 'ArrowRight') show(pos + 1);
  });
  var startX = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(pos + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();
