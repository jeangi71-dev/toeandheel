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

// Steppgeräusch beim Logo: echte Aufnahme von Stepptänzern (ton/steppen4.wav)
// Browser spielen Ton erst, nachdem die Person einmal geklickt, getippt oder eine Taste gedrückt hat. Das lässt sich nicht umgehen;
// deshalb wird hier alles so vorbereitet, dass der Ton ab diesem ersten Moment sofort und zuverlässig da ist.
(function () {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var ctx = null, roh = null, aufnahme = null, entschluesseln = null, letzter = 0, wartet = null;

  // Tondatei schon beim Öffnen der Seite holen (das ist ohne Klick erlaubt)
  var holen = fetch('ton/steppen4.wav')
    .then(function (r) { return r.arrayBuffer(); })
    .then(function (d) { roh = d; })
    .catch(function () {});

  function vorbereiten() {
    if (!ctx) { try { ctx = new AC(); } catch (e) { return; } }
    if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
    if (!aufnahme && !entschluesseln) {
      entschluesseln = holen.then(function () {
        if (!roh) throw new Error('keine Tondatei');
        return ctx.decodeAudioData(roh.slice(0));
      }).then(function (bild) { aufnahme = bild; })
        .catch(function () { entschluesseln = null; });
    }
  }
  function bereit() { return !!ctx && ctx.state === 'running' && !!aufnahme; }

  function abspielen(verzug) {
    letzter = Date.now();
    var quelle = ctx.createBufferSource(); quelle.buffer = aufnahme;
    var laut = ctx.createGain(); laut.gain.value = 0.9;
    quelle.connect(laut); laut.connect(ctx.destination);
    quelle.start(ctx.currentTime + (verzug || 0));
  }

  function steppen(verzug) {
    if (Date.now() - letzter < 900) return;
    vorbereiten();
    if (bereit()) { abspielen(verzug); return; }
    // Ton wacht gerade auf oder wird noch geladen: bis zu 2 Sekunden lang nachfassen, dann einmal spielen
    if (wartet) return;
    var versuche = 0;
    wartet = setInterval(function () {
      versuche++;
      if (bereit()) { clearInterval(wartet); wartet = null; if (Date.now() - letzter >= 900) abspielen(0); }
      else if (versuche > 25) { clearInterval(wartet); wartet = null; }
    }, 80);
  }

  // Erste Berührung der Seite, egal wo: Ton freischalten
  ['pointerdown', 'pointerup', 'mousedown', 'click', 'keydown', 'touchstart', 'touchend'].forEach(function (ev) {
    window.addEventListener(ev, vorbereiten, { passive: true, capture: true });
  });

  var ziele = document.querySelectorAll('.site-head .logo, footer .brand img');
  ziele.forEach(function (el) {
    el.addEventListener('mouseenter', function () { steppen(0.34); });
    el.addEventListener('click', function () { steppen(0); });
    el.addEventListener('touchend', function () { steppen(0); }, { passive: true });
  });
})();

// Logo-Bewegung: zufällig eine andere bei jedem Darüberfahren (Maus) oder Antippen (Finger); oben elf, unten fünf.
// Der Effekt hängt an der Klasse «aktiv», nie an :hover, weil ein Handy «Maus darüber» nach dem Antippen nicht mehr loslässt.
(function () {
  function einrichten(traeger, bild, vorsatz, arten) {
    if (!traeger || !bild) return;
    var letzte = -1, uhr = null, zuletztGetippt = 0;
    function waehlen() {
      var i;
      do { i = Math.floor(Math.random() * arten.length); } while (i === letzte && arten.length > 1);
      letzte = i;
      arten.forEach(function (a) { bild.classList.remove(vorsatz + a); });
      bild.classList.add(vorsatz + arten[i]);
    }
    function an() { waehlen(); traeger.classList.add('aktiv'); }
    function aus() { traeger.classList.remove('aktiv'); }
    function tippen() {
      var jetzt = Date.now();
      if (jetzt - zuletztGetippt < 350) return;   // derselbe Tipp kommt als mehrere Ereignisse
      zuletztGetippt = jetzt;
      clearTimeout(uhr);
      traeger.classList.remove('aktiv');
      void bild.offsetWidth;                      // Bewegung sicher neu starten
      an();
      uhr = setTimeout(aus, 2000);
    }
    function istMaus(e) { return e.pointerType === 'mouse'; }

    waehlen();
    if (window.PointerEvent) {
      traeger.addEventListener('pointerenter', function (e) { if (istMaus(e)) { clearTimeout(uhr); an(); } });
      traeger.addEventListener('pointerleave', function (e) { if (istMaus(e)) aus(); });
      traeger.addEventListener('pointerup', function (e) { if (!istMaus(e)) tippen(); });
    } else {
      traeger.addEventListener('mouseenter', an);
      traeger.addEventListener('mouseleave', aus);
    }
    traeger.addEventListener('touchend', tippen, { passive: true });
    traeger.addEventListener('click', function (e) { if (e.pointerType && e.pointerType !== 'mouse') tippen(); });
  }

  var kopf = document.querySelector('.site-head .logo');
  einrichten(kopf, kopf && kopf.querySelector('.logo-mark'), 'bw-',
    ['ruhig', 'huepf', 'pendel', 'pirouette', 'herz', 'seite', 'muenze', 'ferse', 'licht', 'pudding', 'verbeugung']);
  var fuss = document.querySelector('footer .brand img');
  einrichten(fuss, fuss, 'fw-', ['pendel', 'herz', 'pirouette', 'huepf', 'pudding']);
})();
