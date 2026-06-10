# Supervision-Prototyp – GitHub-ready

Diese ZIP ist für GitHub Pages vorbereitet. `index.html` liegt direkt im Root.

## Wichtig

Die Website ist bereits auf diese Apps-Script-Web-App eingestellt:

```text
https://script.google.com/macros/s/AKfycbyF6jvkT9ZmMojzeEISgjZlNGD1hZ5QP5djd85sk0eBqNQe5UVbCpBSkSC3xethiV2N/exec
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



## Update: Gruppenweite Präsentations-Synchronisierung

Diese Version speichert Präsentationsanpassungen nicht mehr nur lokal im Browser, sondern zusätzlich im `Rohdaten JSON` des Google Sheets:

- Farben und Muster
- zusätzliche Textfelder
- Sticker
- Positionen, Größen, Drehungen
- Layout-/Ebeneninformationen

Dadurch kann eine geteilte Gruppenseite oder Präsentation die gespeicherten Präsentationseinstellungen der jeweiligen Gruppe wieder laden.

Wichtig:
1. Den Inhalt von `apps-script/Code.gs` vollständig in Google Apps Script übernehmen.
2. Speichern.
3. Bestehende Web-App-Bereitstellung bearbeiten.
4. Version: **Neue Version** auswählen.
5. Bereitstellen.
6. Die `/exec`-URL bleibt gleich, sofern die bestehende Bereitstellung bearbeitet wird.

Die Website-Dateien können direkt auf GitHub Pages hochgeladen werden.


## Update: übertragbare Präsentationsgestaltung

Der Bearbeitungsmodus speichert jetzt nur noch Funktionen, die sicher über Google Sheets übertragen werden können:

- Farben und Muster
- Textänderungen, Schriftgrößen und Textfarben
- Positionen, Größen, Drehungen und Ebenen
- Sticker aus dem Projektordner als Pfad/Referenz
- zusätzliche Textboxen

Entfernt wurden lokaler Hintergrundbild-Upload und „Bild entfernen“, weil Base64-Bilder die Übermittlung blockieren können.

Nach dem Hochladen der ZIP muss `apps-script/Code.gs` in Apps Script neu eingefügt und als neue Version bereitgestellt werden, falls du dort noch nicht den aktuellen Code nutzt.

## Update: Geführter Übermittlungsablauf
Diese Version ergänzt einen geführten Ablauf nach der Ergebnissicherung, Pflichtfeld-Prüfungen auf den Phasenseiten, eine klickbare Phasenlegende mit Rot/Grün-Status sowie eine Speicherabfrage im Präsentationseditor.


## Manometer-Feedback
Diese Version ergänzt nach der Ergebnisübermittlung einen Manometer-Feedbackflow mit QR-Code, Feedbackformular, Auswertungsseite und Apps-Script-Speicherung im Tabellenblatt `Manometer Feedback`. Nach Änderung von `apps-script/Code.gs` muss die Google-Apps-Script-Web-App neu bereitgestellt werden.


## Manometer Speicherfix

Das Manometer-Feedback wird ab dieser Version per JSONP/GET gespeichert. Dadurch wartet das Formular auf eine echte Apps-Script-Bestätigung, statt eine no-cors-POST-Anfrage nur scheinbar als erfolgreich zu behandeln. Apps Script muss mit der enthaltenen `apps-script/Code.gs` neu bereitgestellt werden.


## Manometer v4 Hinweis
Für Manometer muss `apps-script/Code.gs` aus dieser ZIP in Google Apps Script übernommen und die Web-App neu bereitgestellt werden. Das Frontend prüft jetzt, ob der Manometer-Endpunkt wirklich aktiv ist; alte Deployments werden als Fehler angezeigt statt als vermeintlicher Erfolg.
