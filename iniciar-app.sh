#!/usr/bin/env bash
# ============================================================
#  iniciar-app.sh  -  Starts the Expo mobile app in web mode.
#  Works regardless of the current directory: it enters app-movil/,
#  fixes permissions when needed, installs dependencies, and starts the app.
#  Usage:  bash iniciar-app.sh
# ============================================================
set -e
DIR="$(cd "$(dirname "$0")/app-movil" && pwd)"
cd "$DIR"

# If the directory is not writable, fix its permissions before installing.
if ! ( : > .permtest 2>/dev/null && rm -f .permtest ); then
  echo "Ajustando permisos de app-movil/ ..."
  chmod -R u+w "$DIR" 2>/dev/null \
    || sudo chown -R "$(id -u)":"$(id -g)" "$DIR" 2>/dev/null \
    || true
fi

echo "Instalando librerias de la app (la primera vez tarda 1-3 min)..."
npm install

echo "Iniciando la app en modo web (puerto 8081)..."
npx expo start --web
