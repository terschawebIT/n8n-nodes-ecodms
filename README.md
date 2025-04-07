# n8n-nodes-ecodms

Diese Node ermöglicht die Integration von [ecoDMS](https://www.ecodms.de/) in n8n.

## Installation

Folgen Sie diesen Schritten, um die Node zu installieren:

```bash
# Globale Installation
npm install -g n8n-nodes-ecodms

# Installation in Ihrer n8n-Installation
cd ~/.n8n/
npm install n8n-nodes-ecodms
```

## Funktionen

Diese Node unterstützt folgende Funktionen:

- **Dokumente**: 
  - Dokumente herunterladen und hochladen
  - Spezifische Klassifikationen von Dokumenten abrufen
  - Klassifikationen erstellen und aktualisieren
  - Dokument-Verknüpfungen hinzufügen und entfernen
  - Versionen zu bestehenden Dokumenten hinzufügen
  - Duplikate prüfen
  - Template-Erkennung für Dokumente
- **Archive**: Verfügbare Archive auflisten und verbinden
- **Suche**: 
  - Einfache und erweiterte Dokumentsuche
  - Komplexe Suchfilter mit mehreren Kriterien
  - Sortierung und Filterung von Suchergebnissen
- **Ordner**: 
  - Komplette Ordnerstruktur abrufen
  - Ordner und Unterordner erstellen
  - Ordner-Attribute bearbeiten
  - Berechtigungen für Ordner festlegen
- **Klassifikation**:
  - Klassifikationsattribute abrufen (normal und detailliert)
  - Dokumenttyp-Klassifikationen abrufen
- **Thumbnails**: Vorschaubilder von Dokumenten herunterladen
- **Lizenzinformationen**: Informationen zur ecoDMS-Lizenz abrufen

## Konfiguration

Um die ecoDMS-Node zu verwenden, benötigen Sie:

1. Die URL Ihres ecoDMS-Servers (mit Port, z.B. http://ecodms.example.com:8080)
2. Einen gültigen Benutzernamen und Passwort
3. Die ID des ecoDMS-Archivs (kann über die API-Funktion "Archive abrufen" ermittelt werden)
4. Optional: Den API-Key, falls dieser aktiviert wurde

## API-Hinweise

Die ecoDMS-API verwendet HTTP Basic Authentication und benötigt für bestimmte Funktionen spezielle Accept-Header:

- Standardmäßig werden Antworten im format `application/json` zurückgegeben
- Für Dokument-Downloads und Thumbnails muss der Accept-Header `*/*` verwendet werden
- Die API unterstützt nur UTF-8-Kodierung

Beachten Sie, dass für die Verwendung der API sogenannte "API connects" benötigt werden:
- 1 API connect = 1 monatlicher Upload oder Download über die ecoDMS API
- Die Anzahl der verfügbaren API connects wird mit dem ersten Upload oder Download in einem neuen Monat zurückgesetzt

## Nutzung

Nach der Installation können Sie die ecoDMS-Node in Ihren Workflows verwenden:

1. Wählen Sie die gewünschte Ressource (Dokument, Archiv, Suche, Thumbnail)
2. Wählen Sie die entsprechende Operation
3. Konfigurieren Sie die erforderlichen Parameter

Beispiele für typische Anwendungsfälle:
- Dokumente aus anderen Systemen automatisiert in ecoDMS archivieren
- Suchergebnisse aus ecoDMS in anderen Systemen weiterverwenden
- Dokumenten-Thumbnails in Weboberflächen anzeigen

## Entwicklung

```bash
# Installation
npm install

# Bauen
npm run build

# Entwicklung mit automatischem Rebuild
npm run dev
```

## Beitragen

Contributions sind willkommen! Bitte erstellen Sie einen Issue oder Pull Request auf GitHub. 