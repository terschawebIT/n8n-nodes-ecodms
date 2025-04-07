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

- **Dokumente**: Dokumente abrufen, herunterladen und hochladen
- **Ordner**: Ordner abrufen und auflisten
- **Suche**: Dokumente nach verschiedenen Kriterien suchen

## Konfiguration

Um die ecoDMS-Node zu verwenden, benötigen Sie:

1. Die URL Ihres ecoDMS-Servers
2. Einen gültigen Benutzernamen und Passwort
3. Den Namen des Mandanten

## Nutzung

Nach der Installation können Sie die ecoDMS-Node in Ihren Workflows verwenden. Wählen Sie die gewünschte Ressource (Dokument, Ordner, Suche) und die entsprechende Operation aus.

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