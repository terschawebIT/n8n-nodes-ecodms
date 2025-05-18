#!/bin/bash

# deploy.sh - Skript zum Aktualisieren und Deployment der n8n-ecoDMS-Node

# Strikte Bash-Einstellungen
set -euo pipefail
IFS=$'\n\t'

# Prüfe ob wir root sind
if [ "$EUID" -ne 0 ]; then 
  echo "Dieses Script muss als root ausgeführt werden!"
  exit 1
fi

# Prüfe ob n8n installiert ist
if ! command -v n8n &> /dev/null; then
  echo "n8n ist nicht installiert!"
  exit 1
fi

# Prüfe ob das n8n Custom-Verzeichnis existiert
N8N_CUSTOM_DIR="/home/n8n/.n8n/custom"
if [ ! -d "$N8N_CUSTOM_DIR" ]; then
  echo "n8n Custom-Verzeichnis existiert nicht: $N8N_CUSTOM_DIR"
  exit 1
fi

echo "=== n8n ecoDMS-Node Update und Deployment ==="

# Repository aktualisieren
echo "[1/8] Git Repository aktualisieren..."
git pull

# Node-Version prüfen
echo "[2/8] Node.js Version prüfen..."
required_node="v20"
current_node=$(node -v)
if [[ ! $current_node =~ ^v20 ]]; then
  echo "Falsche Node.js Version! Benötigt: $required_node, Aktuell: $current_node"
  exit 1
fi

# Abhängigkeiten installieren
echo "[3/8] Abhängigkeiten installieren..."
npm ci

# Tests ausführen
echo "[4/8] Tests ausführen..."
if ! npm test; then
  echo "Tests fehlgeschlagen! Deployment wird abgebrochen."
  exit 1
fi

# Projekt bauen
echo "[5/8] Projekt bauen..."
NODE_ENV=production npm run build

# Backup erstellen
echo "[6/8] Backup erstellen..."
backup_dir="/home/n8n/.n8n/custom_backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
cp -r "$N8N_CUSTOM_DIR"/* "$backup_dir/"

# Dateien kopieren
echo "[7/8] Dateien in n8n Custom-Verzeichnis kopieren..."
cp -r dist/* "$N8N_CUSTOM_DIR/"
chown -R n8n:n8n "$N8N_CUSTOM_DIR"
chmod -R 755 "$N8N_CUSTOM_DIR"

# n8n-Dienst neustarten
echo "[8/8] n8n-Dienst neustarten..."
systemctl restart n8n

# Warte auf n8n-Start
echo "Warte auf n8n-Start..."
for i in {1..30}; do
  if systemctl is-active --quiet n8n; then
    echo "n8n erfolgreich gestartet!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Timeout beim Warten auf n8n-Start!"
    exit 1
  fi
  sleep 1
done

echo "=== Deployment erfolgreich abgeschlossen ===" 