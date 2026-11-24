// Verkleinert zu grosse Fotos im Ordner bilder/ (z. B. direkt vom Handy hochgeladene), damit die Website schnell bleibt.
// Läuft automatisch auf GitHub nach jedem Hochladen (siehe .github/workflows/fotos-verkleinern.yml).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORDNER = 'bilder';
const MAX_SEITE = 1800;            // längste Seite in Pixeln
const MAX_BYTES = 900 * 1024;      // grössere Dateien werden neu gespeichert
const AUSNAHMEN = /^logo/i;        // das Logo bleibt, wie es ist

function alle(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? alle(p) : [p];
  });
}

let geaendert = 0;
for (const datei of alle(ORDNER)) {
  const endung = path.extname(datei).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(endung)) continue;
  if (AUSNAHMEN.test(path.basename(datei))) continue;
  const vorher = fs.statSync(datei).size;
  let meta;
  try { meta = await sharp(datei).metadata(); } catch (e) { console.log('übersprungen (nicht lesbar):', datei); continue; }
  const gedreht = (meta.orientation || 1) > 1;                       // Handy-Fotos liegen oft «auf der Seite»
  const zuGross = Math.max(meta.width || 0, meta.height || 0) > MAX_SEITE;
  if (!zuGross && !gedreht && vorher <= MAX_BYTES) continue;

  let bild = sharp(datei).rotate().resize({ width: MAX_SEITE, height: MAX_SEITE, fit: 'inside', withoutEnlargement: true });
  if (endung === '.png') bild = bild.png({ compressionLevel: 9 });
  else if (endung === '.webp') bild = bild.webp({ quality: 82 });
  else bild = bild.jpeg({ quality: 82, mozjpeg: true });
  const daten = await bild.toBuffer();
  if (daten.length < vorher || gedreht || zuGross) {
    fs.writeFileSync(datei, daten);
    geaendert++;
    console.log(`${datei}: ${Math.round(vorher / 1024)} KB → ${Math.round(daten.length / 1024)} KB`);
  }
}
console.log(geaendert ? `${geaendert} Foto(s) verkleinert.` : 'Alle Fotos haben schon eine passende Grösse.');
