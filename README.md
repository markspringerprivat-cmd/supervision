# Supervision-Prototyp – GitHub-ready

Diese ZIP ist für GitHub Pages vorbereitet. `index.html` liegt direkt im Root.

## Wichtig

Die Website ist bereits auf diese Apps-Script-Web-App eingestellt:

```text
https://script.google.com/macros/s/AKfycbx4K6qaDC0b3fSBMnBbk0M0GT9q2gbojBf6xve-D_4XD6t6u2uQwZDYBNbfevh_0xS0/exec
```

Die URL ist eingetragen in:

- `js/config.js`
- `js/jsConfig.js`
- als Fallback in `js/app.js`

## Upload auf GitHub

Den Inhalt dieser ZIP direkt in das Repository hochladen. Nicht den ZIP-Ordner selbst hochladen, sondern die enthaltenen Dateien und Ordner.

Erwartete Root-Struktur:

```text
index.html
css/
js/
assets/
apps-script/
...
```

## Enthaltene Funktionen

- Rollenverteilung mit QR-Codes
- getrennte Rollenkarten
- rollenabhängige Ablaufseiten
- Supervisor-Phasen mit Pflichtfeldmarkierung
- Zusammenfassung mit Ergebnisübermittlung
- Präsentationsvorbereitung mit Editor
- finale Präsentationsansicht
- Ergebnisübersicht mit Roulette
- Gruppenergebnis teilen über `gruppe-ergebnis.html?g=<GRUPPEN-ID>`
- Gruppenergebnisse werden über Google Sheets geladen

## Apps Script

Im Ordner `apps-script/Code.gs` liegt zusätzlich der aktuelle Apps-Script-Code als Sicherung. Da dein Apps Script jetzt bereits funktioniert, musst du ihn nicht erneut übernehmen.

Falls du ihn später erneut kopierst, prüfe oben in `Code.gs`, dass `SPREADSHEET_URL` auf deine richtige Google-Sheet-Datei zeigt.


Update observer-v13: Beobachtung/Protokoll-Rolle bei 5 Personen ergänzt. Apps Script muss dafür nicht geändert werden, weil dieselben Ergebnisfelder und Rohdaten-JSON verwendet werden.
