#!/bin/bash

# deploy.sh - Skript zum Aktualisieren und Deployment der n8n-ecoDMS-Node

# Fehler abfangen und Skript beenden bei Fehlern
set -e

echo "=== n8n ecoDMS-Node Update und Deployment ==="

# Repository aktualisieren
echo "[1/5] Git Repository aktualisieren..."
git pull

# Projekt bauen
echo "[2/5] Projekt bauen mit pnpm..."
pnpm build

# Dateien kopieren
echo "[3/5] Dateien in n8n Custom-Verzeichnis kopieren..."
cp -r dist/* /home/n8n/.n8n/custom/

# Berechtigungen setzen
echo "[4/5] Berechtigungen für n8n-Benutzer setzen..."
chown -R n8n:n8n /home/n8n/.n8n/custom/

# n8n-Dienst neustarten
echo "[5/5] n8n-Dienst neustarten..."
systemctl restart n8n

echo "=== Deployment abgeschlossen ===" 