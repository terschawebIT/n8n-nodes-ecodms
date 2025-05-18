#!/bin/bash

# deploy.sh - Skript zum Aktualisieren und Deployment der n8n-ecoDMS-Node

# Fehler abfangen und Skript beenden bei Fehlern
set -e

echo "=== n8n ecoDMS-Node Update und Deployment ==="

# Repository aktualisieren
echo "[1/6] Git Repository aktualisieren..."
git pull

# Abhängigkeiten installieren
echo "[2/6] Abhängigkeiten installieren..."
npm install

# Projekt bauen
echo "[3/6] Projekt bauen..."
npm run build

# Dateien kopieren
echo "[4/6] Dateien in n8n Custom-Verzeichnis kopieren..."
cp -r dist/* /home/n8n/.n8n/custom/

# Berechtigungen setzen
echo "[5/6] Berechtigungen für n8n-Benutzer setzen..."
chown -R n8n:n8n /home/n8n/.n8n/custom/

# n8n-Dienst neustarten
echo "[6/6] n8n-Dienst neustarten..."
systemctl restart n8n

echo "=== Deployment abgeschlossen ===" 