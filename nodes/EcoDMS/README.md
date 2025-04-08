# ecoDMS Node für n8n

## Modulare Struktur

Dieses Projekt wurde für bessere Wartbarkeit und Übersichtlichkeit in mehrere Module aufgeteilt:

### Dateistruktur

```
nodes/EcoDMS/
├── EcoDMS.node.ts         # Hauptdatei, die alle Module zusammenführt
├── ecoDms.svg             # Icon für die Node
├── resources/
│   ├── document.ts        # Modul für Dokument-Ressource
│   ├── classification.ts  # Modul für Klassifikations-Ressource
│   └── ...                # Weitere Ressourcen-Module
└── utils/
    ├── constants.ts       # Gemeinsame Konstanten (Resource, Operation)
    └── helpers.ts         # Hilfsfunktionen
```

### Warum diese Struktur?

1. **Bessere Übersichtlichkeit**: Jede Ressource hat eine eigene Datei, was die Codebase übersichtlicher macht.
2. **Einfachere Wartung**: Änderungen an einer bestimmten Ressource betreffen nur eine Datei.
3. **Vermeidung von Duplikaten**: Parameter, die mehrfach verwendet werden, können in einer Datei definiert werden.
4. **Leichteres Hinzufügen neuer Funktionalitäten**: Neue Ressourcen können einfach als neue Module hinzugefügt werden.

### Verwendung

Die Hauptdatei `EcoDMS.node.ts` importiert alle Module und stellt sie zusammen. Um das Projekt zu kompilieren und zu verwenden, sind keine besonderen Schritte erforderlich.

## Fehlerbehebung

Falls bei der Verwendung der Node doppelte Parameter angezeigt werden oder andere Probleme auftreten, überprüfe folgende Punkte:

1. Stelle sicher, dass alle Parameter in der richtigen Resource-Operation-Kombination definiert sind
2. Überprüfe, ob Parameter nicht versehentlich in mehreren Modulen definiert wurden
3. Nach Änderungen an den Modulen muss die Node neu installiert werden mit `npm run build`

## Entwicklung

Um weitere Ressourcen hinzuzufügen:

1. Erstelle eine neue Datei unter `resources/` (z.B. `resources/search.ts`)
2. Definiere die Operations und Fields für diese Ressource
3. Importiere die neue Datei in `EcoDMS.node.ts` und füge die Operations und Fields hinzu 