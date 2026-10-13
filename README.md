# Proyecto DevSecOps CIB 204

Universidad Cenfotec - Maestría en Ciberseguridad

Aplicación móvil Expo/React Native que consume un servicio de cifrado RSA en
Node.js, protegido mediante Keycloak y ejecutado en contenedores. El pipeline
de GitHub Actions analiza el código, los secretos, las dependencias, la imagen
y la aplicación en ejecución.

## Estado de la línea base

La rama `main` conserva una línea base insegura para registrar los resultados
iniciales del análisis DevSecOps. Los hallazgos se documentan en el Entregable
1 y se corrigen en la fase de remediación.

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

## Ejecución en Codespaces

```bash
docker compose up -d --build
cd app-movil
npm install
npx expo start --web
```

Los puertos utilizados son 3000 para la API, 8080 para Keycloak y 8081 para
Expo Web. La guía del curso describe el procedimiento completo y los criterios
de interpretación de los resultados.

## Fases

- Diagnóstico: registro de la línea base y de los hallazgos de seguridad.
- Remediación: corrección del código, dependencias, imagen y configuración;
  posteriormente se repite el pipeline.
