# Supervision-Prototyp für GitHub Pages

Diese Version ist auf die aktualisierte Google-Sheet-Tabelle abgestimmt.

## Enthalten

- `index.html` direkt im Root für GitHub Pages
- Rollenverteilung mit QR-Codes
- Rollenkarten und Vorbereitungsseiten
- 6 Phasen für 4 Rollen
- Supervisor-Seiten mit Eingabefeldern für die spätere Tabelle
- `zusammenfassung.html` zum Prüfen und Speichern der Ergebnisse
- `ergebnisse.html` zum Auslesen der gespeicherten Gruppen
- `google-test.html` zum Verbindungstest
- `apps-script/Code.gs` mit neuer Tabellenstruktur

## Google Apps Script aktualisieren

1. Öffne dein Apps-Script-Projekt.
2. Ersetze den kompletten Inhalt von `Code.gs` durch den Inhalt aus `apps-script/Code.gs` dieser ZIP.
3. Trage dein Admin-Passwort in `ADMIN_PASSWORD` ein.
4. Speichern.
5. `Bereitstellen` → `Bereitstellungen verwalten` → bestehende Web-App bearbeiten.
6. Bei Version `Neue Version` wählen.
7. Bereitstellen.

## Tabelle neu aufsetzen

Damit die Überschriften sauber gesetzt werden:

1. In Apps Script die Funktion `resetSheet` auswählen.
2. Einmal ausführen.
3. Danach enthält das Tabellenblatt `Ergebnisse` die neuen Spalten.

Achtung: `resetSheet` löscht vorhandene Testdaten.

## Gespeicherte Spalten

Die Website sendet jetzt u. a. diese Felder:

- Probleme / Beobachtungen, Gefühle und Wünsche getrennt nach Schulleitung, Lehrkraft A und Lehrkraft B
- individuelle Ziele und gemeinsame Zielvereinbarung
- Brainstorming / hilfreiche Kritik
- Anerkennungsrunde / Perspektiven
- Absprachen zum weiteren Vorgehen
- Zustimmung / Rückmeldung
- Unterstützung durch Schulleitung
- erste konkrete Umsetzungsschritte
- Einschätzung der Praxistauglichkeit

## GitHub Pages

Den Inhalt der ZIP direkt in dein Repository hochladen. `index.html` muss auf oberster Ebene liegen.
