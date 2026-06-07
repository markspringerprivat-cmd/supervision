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


## Gruppenzuweisung

Die Startseite enthält zusätzlich `gruppenzuweisung.html`. Dort kann eine vorbefüllte Teilnehmendenliste bearbeitet und zufällig in Gruppen mit mindestens vier Personen eingeteilt werden. Die Daten werden lokal im Browser gespeichert und können über die lokalen Reset-Funktionen gelöscht werden.


## Letzte Änderungen
- Globaler Administrationsmodus über die obere Leiste mit Passwortmaske, Sternchen-Eingabe und Augen-Schalter.
- `Seite zurücksetzen` löscht lokale Arbeitsdaten und führt zurück zur Startseite.
- Ergebnis-Karten enthalten `Präsentation starten`.
- Neue Seite `presentation.html` zeigt ein Gruppenergebnis als Folienpräsentation mit Pfeiltasten, Leertaste und Vollbildmodus.
