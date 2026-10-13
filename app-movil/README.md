# Aplicación móvil CIB 204

Cliente Expo/React Native que consume el servicio de cifrado.

## Ejecución web

```bash
cd app-movil
npm install
npx expo start --web
```

Expo Web utiliza el puerto 8081 reenviado por Codespaces.

## Ejecución en dispositivo físico

Expo Go permite ejecutar la aplicación mediante un túnel:

```bash
npx expo start --tunnel
```

La URL pública reenviada para el puerto 3000 se configura en el campo URL del
servicio. Desde un dispositivo físico no se utiliza `localhost` para acceder al
Codespace.
