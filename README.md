# Supervision-Prototyp – GitHub Pages

Diese Version enthält die Ergebnisübersicht mit Karussell, Zufallsauswahl und Einzellöschung.

## Upload auf GitHub

Den Inhalt dieser ZIP direkt in das GitHub-Repository hochladen. `index.html` liegt direkt im Root.

## Wichtig für Google Apps Script

Wenn du die Löschfunktion nutzen möchtest, musst du den Inhalt aus `apps-script/Code.gs` in dein Apps-Script-Projekt kopieren.

Danach:

1. Speichern.
2. **Bereitstellen → Bereitstellungen verwalten** öffnen.
3. Bestehende Web-App-Bereitstellung bearbeiten.
4. Bei Version **Neue Version** auswählen.
5. Bereitstellen.

Wenn du die bestehende Bereitstellung bearbeitest, bleibt die `/exec`-URL gleich.

## Passwort

Im Apps-Script-Code steht:

```js
const ADMIN_PASSWORD = 'HIER_DEIN_PASSWORT_EINTRAGEN';
```

Dort dein eigenes Passwort eintragen. Genau dieses Passwort wird für das Löschen einzelner Einträge und für das Löschen aller Einträge abgefragt.

## Ergebnisübersicht

`ergebnisse.html` zeigt die Gruppen als Karussell. Die Zufallsauswahl läuft im Kreis weiter und wird schrittweise langsamer. Nach der Auswahl erscheint ein kurzer Konfetti-Effekt.

## Lokales Zurücksetzen

Oben am Bildschirmrand gibt es auf jeder Seite zwei lokale Reset-Optionen:

- **Aktuelle Seite leeren** löscht die Eingaben auf der aktuell geöffneten Seite im Browser.
- **Alles zurücksetzen** löscht alle lokal gespeicherten Website-Daten in diesem Browser, z. B. Rollen, Notizen, Phasenangaben, Zusammenfassung und Rundenmarkierungen. Google-Sheet-Einträge werden dadurch nicht gelöscht.

Auf der Ergebnisseite gibt es zusätzlich **Runden zurücksetzen**. Damit werden nur die bisherigen Roulette-/Zufallsrunden zurückgesetzt, nicht die gespeicherten Gruppenergebnisse.
