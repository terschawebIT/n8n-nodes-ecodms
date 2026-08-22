# Changelog

## 1.0.7 — 2026-08-22

Handler nachgezogen, die in der UI schon existierten, aber `Die Operation wird nicht unterstützt` warfen.

- **`checkDuplicates`**: `POST /api/checkDuplicates/{maxMatchValue}` (1–100, Default 80). Antwort: `hasDuplicates`, `duplicateCount`, `duplicates` (ohne Thumbnails). Binary bleibt am Item.
- **`uploadToInbox`**: `POST /api/uploadFileToInbox`, optionales Feld `inboxRights`. Antwort: `inboxId`.
- Binary-Upload nutzt `getBinaryDataBuffer` (n8n lagert große Dateien aus).
- **#2**: Credential-Test wertet „SSL-Zertifikate ignorieren“ als echtes Boolean aus.
- **#3**: „Suchen und Herunterladen“ nutzt jetzt die UI-Filter (Custom-Felder + Operatoren) statt einer ignorierten Volltextsuche.

Leere `duplicates: []` heißt laut ecoDMS-API: Duplikaterkennung am Server aus, Datei ungültig, oder kein Treffer über dem Schwellwert.

Noch ohne Handler (UI vorhanden): `uploadWithPdf`, `getTemplatesForFile`, `addVersionWithPdf`, `getClassificationWithTemplateRecognition`. Inbox-Download und `moveInboxFileToArchive` fehlen weiter ([#4](https://github.com/terschawebIT/n8n-nodes-ecodms/issues/4)).

## 1.0.6 — 2026-02-03

npm-Stand vor diesem Release.
