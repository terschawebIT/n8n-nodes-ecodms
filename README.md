# n8n-nodes-ecodms

[![CI](https://github.com/terschawebIT/n8n-nodes-ecodms/actions/workflows/ci.yml/badge.svg)](https://github.com/terschawebIT/n8n-nodes-ecodms/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/terschawebIT/n8n-nodes-ecodms)](https://github.com/terschawebIT/n8n-nodes-ecodms/releases/latest)
[![npm](https://img.shields.io/npm/v/n8n-nodes-ecodms)](https://www.npmjs.com/package/n8n-nodes-ecodms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

n8n Community-Node für [ecoDMS](https://www.ecodms.de/) — Dokumente suchen, hochladen, klassifizieren und archivieren.

Aktuelles GitHub-Release: [v1.0.7](https://github.com/terschawebIT/n8n-nodes-ecodms/releases/tag/v1.0.7). npm kann etwas hinterherhinken.

## Inhaltsverzeichnis

- [Installation](#installation)
- [Credentials](#credentials)
- [Funktionen](#funktionen)
- [API-Hinweise](#api-hinweise)
- [Nutzung](#nutzung)
- [Nutzung mit dem AI-Agent](#nutzung-mit-dem-ai-agent)
- [Fehlerbehandlung](#fehlerbehandlung)
- [Entwicklung](#entwicklung)
- [Publish](#publish)
- [Projektstruktur](#projektstruktur)
- [Beitragen](#beitragen)

## Installation

Braucht n8n 1.x/2.x und Node.js 20+.

### Community Nodes (empfohlen)

**n8n → Settings → Community Nodes → Install**

Paketname (npm, zuletzt **1.0.6**):

```text
n8n-nodes-ecodms
```

Oder die Git-URL für den aktuellen Stand (1.0.7+):

```text
https://github.com/terschawebIT/n8n-nodes-ecodms.git
```

CLI:

```bash
n8n install n8n-nodes-ecodms
# oder
n8n install https://github.com/terschawebIT/n8n-nodes-ecodms.git
```

### Manuell im n8n-Datenordner

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-ecodms
# aktueller GitHub-Stand:
npm install github:terschawebIT/n8n-nodes-ecodms
```

Danach n8n neu starten. Die Node erscheint als **ecoDMS**.

### Docker

```dockerfile
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-ecodms
```

Bei Image-Varianten mit User `node` oft:

```dockerfile
RUN mkdir -p /home/node/.n8n/nodes \
	&& cd /home/node/.n8n/nodes \
	&& npm install n8n-nodes-ecodms
```

## Credentials

Unter **Credentials** einen Eintrag **ecoDMS API** anlegen:

| Feld | Beschreibung |
|------|----------------|
| **Server URL** | Basis-URL inkl. Port, ohne `/api` (z. B. `https://ecodms.example.com:8080`) |
| **Benutzername** | ecoDMS-Benutzer mit API-Recht |
| **Passwort** | Passwort dieses Benutzers |
| **Archiv-ID** | ID des Archivs (`GET /api/archives`) |
| **API-Key** | optional, nur wenn am Server aktiviert |
| **SSL-Zertifikate ignorieren** | für selbst-signierte Zertifikate (nur in vertrauenswürdigen Netzen) |

Auth: HTTP Basic. Rollen je nach Operation, u. a. `ecoSIMSCLASSIFY` (Klassifikation) und `ecoICELogon` (Inbox).

## Funktionen

- **Dokumente**: herunterladen und hochladen, Klassifikationen und Versionen, Verknüpfungen, Duplikate prüfen (`checkDuplicates`), PDF in die Inbox (`uploadToInbox`)
- **Archive**: auflisten, verbinden, Infos
- **Suche**: Volltext, erweiterte Filter (inkl. Custom-Felder `dyn_*` und Operatoren), Suche und Download
- **Ordner**: Struktur, anlegen, Attribute, Rechte
- **Klassifikation**: Attribute, Dokumenttypen, klassifizieren (Archiv und Inbox)
- **Dokumenttypen**: Liste und Details
- **Thumbnails**: Vorschaubilder
- **Lizenz**: Lizenzinfo und API-Connects

Details zu 1.0.7: [CHANGELOG.md](CHANGELOG.md).

## API-Hinweise

- Antworten standardmäßig `application/json`, Downloads/Thumbnails `Accept: */*`
- Kodierung nur UTF-8
- **`checkDuplicates`**: `POST /api/checkDuplicates/{maxMatchValue}`. Leere `duplicates: []` heißt oft: Duplikaterkennung in den ecoDMS-Einstellungen **aus** — nicht „kein Duplikat“.
- **`uploadToInbox`**: nur PDF, Rolle `ecoICELogon`. Antwort ist eine Inbox-ID, keine Archiv-DocID.

API-Connects (Lizenz):

- 1 Connect = 1 monatlicher Upload oder Download über die API
- Zähler setzt sich zu Monatsbeginn zurück
- Anzahl hängt vom Lizenzmodell ab

Offizielle Doku: [ecoDMS API](https://www.ecodms.de/index.php/de/api-schnittstelle).

## Nutzung

1. ecoDMS-Node in den Workflow ziehen
2. Ressource und Operation wählen
3. Credential und Parameter setzen

Typische Ketten:

```
E-Mail-Anhang → ecoDMS (Dokument hochladen)
ecoDMS (Suche) → HTTP Request
Webhook → ecoDMS (Klassifikation aktualisieren)
Datei → ecoDMS (checkDuplicates) → upload / uploadToInbox
```

## Nutzung mit dem AI-Agent

Die Node ist mit dem n8n AI-Agent nutzbar. Beispiele:

- „Suche nach allen Dokumenten mit dem Stichwort Rechnung im Ordner Finanzen“
- „Lade das Dokument mit der ID 123 herunter und speichere es als PDF“
- „Erstelle einen neuen Ordner für das Jahr 2026“
- „Aktualisiere die Klassifikation des Dokuments mit der ID 456“
- „Zeige alle verfügbaren Dokumenttypen“

## Fehlerbehandlung

- **404**: falsche Dokument-, Klassifikations- oder Ordner-ID
- **401**: Auth oder fehlende Rolle
- **413**: Upload größer als das Limit des ecoDMS-REST-Dienstes
- **`checkDuplicates` immer leer**: Duplikaterkennung am Server einschalten
- **`Die Operation wird nicht unterstützt`**: UI-Eintrag ohne Handler (siehe [CHANGELOG](CHANGELOG.md) 1.0.7)
- **self-signed certificate**: Checkbox „SSL-Zertifikate ignorieren“ in den Credentials, ab 1.0.7 auch im Credential-Test

Prüfen: Server-URL inkl. Port, Credentials, Rollen, existierende IDs.

## Entwicklung

```bash
npm install
npm run lint
npm run build
```

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Sicherheitslücken: [SECURITY.md](SECURITY.md).

## Publish

```bash
npm run lint
npm run build
git tag vX.Y.Z
git push origin vX.Y.Z
```

[`.github/workflows/publish.yml`](.github/workflows/publish.yml) lintet, baut und legt ein GitHub Release an.

npm publish folgt, sobald der npmjs-Zugang (2FA) wiedersteht. Bis dahin: GitHub-Release oder `npm install github:terschawebIT/n8n-nodes-ecodms`.

## Projektstruktur

```
nodes/EcoDMS/
├── EcoDMS.node.ts
├── ecoDms.svg
├── handlers/              # API-Aufrufe
├── resources/             # UI-Felder je Ressource
└── utils/
credentials/EcoDmsApi.credentials.ts
```

Neue Ressource: Datei unter `resources/`, Handler unter `handlers/`, in `EcoDMS.node.ts` einhängen.

## Beitragen

Issues und Pull Requests: [terschawebIT/n8n-nodes-ecodms](https://github.com/terschawebIT/n8n-nodes-ecodms/issues).

Bitte [CONTRIBUTING.md](CONTRIBUTING.md) lesen. Dieses Repo ist öffentlich — keine internen Hosts, Tokens oder Kundendaten.

## License

[MIT](LICENSE.md)
