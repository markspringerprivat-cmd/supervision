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

Diese Version enthält zwei lokale Reset-Ebenen:

- **Aktuelle Seite leeren**: löscht die lokal gespeicherten Eingaben der aktuell geöffneten HTML-Seite.
- **Alles lokal zurücksetzen / Arbeitsseiten zurücksetzen**: löscht alle lokal gespeicherten Website-Daten im aktuellen Browser, also Rollenverteilung, Vorbereitungsnotizen, Phasennotizen, Zusammenfassung und Roulette-Runden. Die Google-Sheet-Ergebnisse werden dadurch nicht gelöscht.

Auf der Ergebnisseite gibt es zusätzlich **Runden zurücksetzen**. Dieser Button löscht nur die bereits gezogenen Roulette-Runden und macht alle Gruppen wieder für die Zufallsauswahl verfügbar. Die Google-Sheet-Ergebnisse bleiben erhalten.
