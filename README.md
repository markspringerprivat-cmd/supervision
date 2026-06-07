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


## Google-Sheet-Anbindung – bereits vorbereitet

In `js/config.js` ist die bereitgestellte Apps-Script-Web-App-URL bereits eingetragen:

```js
APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwP6wUvGYMAwlEvMPDCLPahCWj3gxn7k5FD_0t_mcPU4W4GJGl8swc_Tgm8iCErfHA/exec"
```

In `apps-script/Code.gs` ist die Google-Sheet-ID bereits eingetragen:

```js
const SPREADSHEET_ID = '1egAveElyXdI9nC4yQfZCtUUwqn8-byODELn4mvuzY';
const SHEET_NAME = 'Ergebnisse';
```

Wichtig: `ADMIN_PASSWORD` im Apps Script selbst ersetzen und danach neu bereitstellen.

Wenn du den Apps-Script-Code änderst, musst du in Apps Script erneut auf **Bereitstellen > Bereitstellungen verwalten > Bearbeiten > Neue Version > Bereitstellen** gehen.


## Fehlerbehebung Google Sheet

Wenn beim Speichern die Meldung erscheint, dass keine Apps-Script-URL gefunden wurde, lädt der Browser vermutlich noch eine alte Version oder `js/config.js` wurde nicht mit hochgeladen. In dieser Version ist die URL zusätzlich fest in `js/app.js` als `DEFAULT_APPS_SCRIPT_URL` hinterlegt.

Teste nach dem Hochladen die Seite `google-test.html`. Dort wird angezeigt, welche URL die Website wirklich verwendet.

Wenn die direkte Apps-Script-URL eine Google-Drive-Fehlermeldung zeigt, liegt das nicht an GitHub Pages, sondern an der Apps-Script-Bereitstellung. Dann in Apps Script neu bereitstellen:

- Bereitstellen > Bereitstellungen verwalten > Bearbeiten
- Zugriff: Jeder
- Ausführen als: Ich
- Version: Neue Version
- Danach die neue `/exec`-URL kopieren und in `js/config.js` ersetzen.
