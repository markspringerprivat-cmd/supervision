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

## Update: Zusammenfassung und Präsentationsvorbereitung

- Auf der Zusammenfassungsseite werden die Phasen jetzt unter dem einklappbaren Bereich **Übersicht** untereinander angezeigt.
- Zwischen **Übermittlung** und **Übersicht** gibt es den Bereich **Präsentation**.
- Dort kann eine kleine Präsentationsvorschau geöffnet werden.
- Im Bearbeitungsmodus können Tabelleninhalte der Präsentation direkt verändert werden. Diese Änderungen werden lokal in denselben Feldern gespeichert, die beim Absenden an Google Sheets übertragen werden.
- Die Präsentationsvorschau enthält eine Farbauswahl für Überschrift, Text, Hintergrund und Folie.
- Zusätzliche Textfelder können eingefügt und verschoben werden; sie werden mit dem Gruppenergebnis gespeichert und später in der Präsentation wieder angezeigt.
- **Ergebnisse ansehen** auf der Start- und Zusammenfassungsseite ist nur noch im Administrationsmodus zugänglich.

## Update: stabilisierte Präsentationsbearbeitung

Diese Version enthält eine überarbeitete Präsentationsbearbeitung in der Zusammenfassung:

- Änderungen werden erst übernommen, wenn im Präsentationseditor auf **Speichern** geklickt wird.
- Beim Schließen mit ungespeicherten Änderungen wird gefragt, ob gespeichert oder verworfen werden soll.
- **Zurücksetzen** stellt den zuletzt gespeicherten Stand wieder her.
- Der Bearbeitungsmodus verschiebt Elemente nicht mehr automatisch an den linken oberen Rand.
- Es gibt zwei Ebenen: eine Design-Leiste und eine Kontext-Leiste für das ausgewählte Element.
- Schriftgröße und Textfarbe können für das ausgewählte Element bzw. markierten Text angepasst werden.
- Elemente, Tabellen, Überschriften, Textboxen und Sticker können verschoben und skaliert werden.
- Sticker können über den Drehgriff oder die Drehen-Funktion rotiert werden.
- Sticker wurden mit transparentem Hintergrund aufbereitet.

## Aktualisierung: Präsentationseditor

Der Präsentationseditor wurde überarbeitet:

- Bearbeitungswerkzeuge erscheinen erst im Bearbeitungsmodus.
- Die letzten drei Änderungen können über „Rückgängig“ zurückgenommen werden.
- Sticker können eingefügt, verschoben, skaliert und über das Drehsymbol gedreht werden.
- Die Auswahl bleibt aktiv, wenn in der Bearbeitungsleiste Einstellungen geändert werden.
- Änderungen werden erst durch „Speichern“ übernommen.
- Hintergrundbilder werden über den Dateiauswahldialog in die Präsentationsvorschau geladen.
- Sticker wurden mit transparenterem Hintergrund neu aufbereitet.
