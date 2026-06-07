# Gruppensupervision ESE – Website-Prototyp

Statischer Prototyp für GitHub Pages mit HTML, CSS und JavaScript.

## Inhalt

- `index.html` – Startseite
- `rollen.html` – Namen eintragen, Rollen zufällig verteilen, QR-Codes erzeugen
- `rolle-*.html` – Rollenkarten für Supervisor*in, Schulleitung, Lehrkraft A, Lehrkraft B
- `gedanken-*.html` – Vorbereitungsnotizen je Rolle
- `phase1-*.html` bis `phase6-*.html` – 24 Phasenseiten je Rolle
- `zusammenfassung.html` – Ergebnissicherung für Supervisor*in
- `ergebnisse.html` – zentrale Übersicht aus Google Sheet
- `apps-script/Code.gs` – Google Apps Script für Google Sheet

## Lokale Speicherung

Notizen werden im Browser mit `localStorage` gespeichert. Das ist zuverlässiger als Cookies, weil die Notizen länger sein können. Die Speicherung bleibt lokal auf dem jeweiligen Gerät.

## QR-Codes

Die QR-Codes werden über `api.qrserver.com` erzeugt. Die QR-Links enthalten Gruppen-ID und Rollenverteilung als URL-Parameter, damit Handys nach dem Scannen die richtige Rollenkarte öffnen.

## Veröffentlichung auf GitHub Pages

1. Neues GitHub Repository erstellen.
2. Alle Dateien dieses Ordners hochladen.
3. Repository Settings > Pages.
4. Branch `main`, Ordner `/root` auswählen.
5. Speichern und die GitHub-Pages-URL abwarten.

## Google Sheet einrichten

1. Neues Google Sheet erstellen.
2. Erweiterungen > Apps Script öffnen.
3. Inhalt aus `apps-script/Code.gs` einfügen.
4. Speichern.
5. Bereitstellen > Neue Bereitstellung > Web-App.
6. Ausführen als: Ich.
7. Zugriff: Jeder mit dem Link.
8. Web-App-URL kopieren.
9. In `js/config.js` bei `APPS_SCRIPT_URL` eintragen.

Danach können Ergebnisse über `zusammenfassung.html` an das Sheet gesendet und über `ergebnisse.html` angezeigt werden.

## Hinweis zum Datenschutz

Für den Seminarkontext sollten keine echten Schüler*innennamen und keine sensiblen personenbezogenen Daten eingetragen werden.
