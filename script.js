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

// Steppgeräusch beim Logo: echte Aufnahme von Stepptänzern (ton/steppen4.wav, freie Lizenz CC0)
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var ctx = null, aufnahme = null, laden = null, letzter = 0;

  function holen() {
    if (laden) return laden;
    laden = fetch('ton/steppen4.wav')
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (a) { return ctx.decodeAudioData(a); })
      .then(function (b) { aufnahme = b; })
      .catch(function () { laden = null; });
    return laden;
  }

  function bereit() {
    if (!ctx) { try { ctx = new AC(); } catch (e) { return false; } }
    if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
    holen();
    return ctx.state === 'running' && !!aufnahme;
  }

  function steppen(verzug) {
    var jetzt = Date.now();
    if (jetzt - letzter < 900) return;
    if (!bereit()) {
      // beim allerersten Klick ist der Ton noch am Aufwachen: kurz danach nochmals versuchen
      if (ctx && !verzug) setTimeout(function () { if (ctx.state === 'running' && aufnahme) steppen(0); }, 250);
      return;
    }
    letzter = jetzt;
    var quelle = ctx.createBufferSource(); quelle.buffer = aufnahme;
    var laut = ctx.createGain(); laut.gain.value = 0.9;
    quelle.connect(laut); laut.connect(ctx.destination);
    quelle.start(ctx.currentTime + (verzug || 0));
  }

  // Browser erlauben Ton erst nach dem ersten Tippen oder Klicken auf der Seite
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { bereit(); }, { passive: true });
  });

  var ziele = document.querySelectorAll('.site-head .logo, footer .brand img');
  ziele.forEach(function (el) {
    el.addEventListener('mouseenter', function () { steppen(0.34); });
    el.addEventListener('click', function () { steppen(0); });
  });
})();

// Logo-Bewegung: bei jedem Darüberfahren zufällig eine von elf (nie zweimal dieselbe hintereinander)
(function () {
  var logo = document.querySelector('.site-head .logo');
  var bild = logo && logo.querySelector('.logo-mark');
  if (!bild) return;
  var arten = ['ruhig', 'huepf', 'pendel', 'pirouette', 'herz', 'seite', 'muenze', 'ferse', 'licht', 'pudding', 'verbeugung'];
  var letzte = -1;
  function waehlen() {
    var i;
    do { i = Math.floor(Math.random() * arten.length); } while (i === letzte);
    letzte = i;
    arten.forEach(function (a) { bild.classList.remove('bw-' + a); });
    bild.classList.add('bw-' + arten[i]);
  }
  waehlen();

  var zeiger = 'mouse', uhr = null;
  function an() { waehlen(); logo.classList.add('aktiv'); }
  function aus() { logo.classList.remove('aktiv'); }
  window.addEventListener('pointerdown', function (e) { zeiger = e.pointerType || 'mouse'; }, { passive: true, capture: true });
  // Maus: gross, solange sie darüber ist
  logo.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') an(); });
  logo.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') aus(); });
  // Finger: antippen zeigt Bewegung und Ton, danach geht das Logo von selbst zurück
  logo.addEventListener('click', function () {
    if (zeiger === 'mouse') return;
    clearTimeout(uhr);
    logo.classList.remove('aktiv'); void logo.offsetWidth;
    an();
    uhr = setTimeout(aus, 2000);
  });
  // Tastatur: beim Ansteuern mit der Tab-Taste ebenfalls zeigen
  logo.addEventListener('focus', function () { if (logo.matches(':focus-visible')) an(); });
  logo.addEventListener('blur', aus);
})();
