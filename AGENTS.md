# Toe & Heel Hergiswil – Website (toeandheel.ch)

- Neubau der Vereins-Website (vorher Jimdo, Mitgliedschaft gekündigt). Gewählte Gestaltung: Variante C «Showtime» (Nachtblau, Tomatenrot, Senfgelb, Creme; Bebas Neue + Archivo; Bögen, Sterne, Laufband). Stand 23.11.2026.
- Reine statische Seite ohne Baukasten: index.html (alles auf einer Seite), impressum.html, datenschutz.html, styles.css, script.js. Keine Bibliotheken, keine Cookies, keine Auswertung, keine Fremd-Schriften (Schriften liegen in schrift/). Why: läuft bei jedem Anbieter, kein Cookie-Hinweis nötig.
- Bilder in bilder/ (b01 = Logo, b14–b27 Show 2025 von Martin Ziegler PHOTO, b28–b30 Tanzfestival von Roberto Conciatori – Bildnachweis nie entfernen). Medienberichte als Dateien in medien/.
- Inhalte stammen wörtlich von der alten Seite; nichts erfinden (keine Preise, Zitate, Zahlen).
- Kontaktformular öffnet das E-Mail-Programm (mailto), es gibt keinen Server.
- Offen: Anbieter für die neue Seite und Umzug der Adresse toeandheel.ch; Zeit Irischer Stepptanz (alte Seite nennt 19.15 und 19.10 Uhr).
- Bildschirmfotos zur Prüfung: Chrome ohne Fenster mit --force-prefers-reduced-motion, sonst bleiben Einblend-Effekte unsichtbar.

## Stand 23.11.2026 (Abend)
- Online zur Ansicht (GitHub Pages, Projekt jeangi71-dev/toeandheel): Startseite = «Showtime» (index.html + styles.css), zweite Variante «Bühne im Scheinwerferlicht» = buehne.html + buehne.css (noindex). Beide teilen script.js, Bilder, Ton. Welche Variante die Startseite wird, ist noch nicht entschieden. logo-vorschau.html ist nur eine Auswahlhilfe für Logo-Bewegungen.
- Nach jeder Änderung an styles.css, buehne.css oder script.js die Versionsnummer im Link (?v=…) in den HTML-Dateien erhöhen, sonst zeigt der Browser die alte Fassung.
- Logo: bilder/logo.png (rund freigestellt aus dem Vereinslogo, 1:1, nicht neu zeichnen). In der Kopfzeile wächst es beim Darüberfahren und zeigt zufällig eine von sechs Bewegungen (Pendeln, Verbeugung, Ferse–Spitze, Herzschlag, Pirouette, Hüpfen; Klassen bw-… in beiden CSS, Auswahl in script.js). Der «Stepp-Kipper» wurde auf Wunsch entfernt – nicht wieder einbauen.
- Logo-Ton: ton/steppen4.wav = vom Kunden gewählter Ausschnitt (ab Sekunde 3,685, 1,55 s) aus der Aufnahme «tap dance practice» (Freesound-Gemeinschaft). Kein künstlich erzeugter Ton. Browser spielen ihn erst nach dem ersten Klick auf die Seite.
- Bühnen-Variante, Wünsche des Kunden: Lichtkegel nur im Kopf und immer mit sichtbarem Scheinwerfer (Traverse); keine Kegel «aus dem Nichts», keine gezeichneten Lichtpunkte, keine Lichtflecken. Weiche Ränder nur über conic-gradient (clip-path + blur ergibt harte Kanten). Kein kräftiges Gelb, kein Türkis; Farbfamilie Aubergine/Violett/Magenta/Rosé mit Champagner-Gold als Akzent. Abschnitte gehen fliessend ineinander über (jeder beginnt mit der Endfarbe des vorherigen). Grössen richten sich nach Breite und Höhe des Bildschirms.
- Kontakt-Titel heisst «Komm vorbei und schnuppere».
- Umzug: Adresse toeandheel.ch ist bei Jimdo registriert, Abo läuft bis Ende Dezember 2026. Der Kunde holt den Transfercode; empfohlen wurde Infomaniak (Alternative Hostpoint). Danach Adresse bei GitHub Pages eintragen.
- Werkzeuge im Projekt: .claude/skills/web-design-guidelines (Vercel) und playwright-cli (zum Durchklicken der echten Seite; lokale Dateien kann es nicht öffnen).
