# Proyecto DevSecOps CIB 204

Universidad Cenfotec - Maestría en Ciberseguridad

Aplicación móvil Expo/React Native que consume un servicio de cifrado RSA en
Node.js, protegido mediante Keycloak y ejecutado en contenedores. El pipeline
de GitHub Actions analiza el código, los secretos, las dependencias, la imagen
y la aplicación en ejecución.

## Estado de la remediación

La fase 2 aplica controles de autenticación, validación de entradas, cifrado
RSA-2048 con OAEP-SHA256, dependencias actualizadas, cabeceras de seguridad,
imagen sin privilegios y configuración externa para secretos. Las evidencias de
la línea base se conservan en `evidencias/` para documentar el antes y después.

## Arquitectura

```
App móvil (Expo/React Native)  ->  API de cifrado (Node.js/RSA)  ->  Keycloak (IAM)
        app-movil/                        servidor/               docker-compose.yml
                          Pipeline: .github/workflows/devsecops.yml
```

## Controles del pipeline

| Capa | Herramienta | Alcance |
|------|-------------|---------|
| SAST | Semgrep + CodeQL | Código JavaScript, inyección y configuración de seguridad |
| Secretos | Gitleaks | Secretos, archivos `.env` y llaves privadas versionadas |
| SCA | npm audit + Trivy | Dependencias vulnerables |
| Imagen | Trivy + Syft | Vulnerabilidades de la imagen y SBOM |
| DAST | OWASP ZAP | Cabeceras HTTP, CORS y comportamiento de la API |

## Ejecución local o en Codespaces

```bash
cp .env.example .env
# Editar .env y establecer una contraseña local para Keycloak.
docker compose up -d --build
cd app-movil
npm install
npx expo start --web
```

Los puertos utilizados son 3000 para la API, 8080 para Keycloak y 8081 para
Expo Web. En Codespaces, `KEYCLOAK_PUBLIC_URL`, `KEYCLOAK_ISSUER` y
`ORIGEN_PERMITIDO` deben apuntar a las URL reenviadas de los puertos 8080 y
8081, respectivamente.

## Fases

- Primer avance: registro de la línea base y de los hallazgos de seguridad.
- Segundo avance: corrección del código, dependencias, imagen y configuración;
  posteriormente se repite el pipeline y se documentan las pruebas manuales.
