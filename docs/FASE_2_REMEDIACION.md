# Fase 2 - Remediacion y verificacion

## Alcance

La remediacion corrige los hallazgos registrados en el primer avance y
establece una configuracion segura para el servicio de cifrado, Keycloak, la
imagen Docker y el pipeline de GitHub Actions.

## Controles implementados

| Control | Implementacion | Verificacion |
|---|---|---|
| Secretos | Variables de entorno, `.env.example`, `.gitignore` y exclusiones Docker | Gitleaks en Actions |
| Dependencias | Versiones actuales de Express, Helmet, express-jwt, jwks-rsa y mysql2 | `npm audit --audit-level=high` |
| SAST | Parser aritmetico seguro, SQL parametrizado y `execFile` con argumentos fijos | Semgrep y CodeQL |
| Autenticacion | JWKS de Keycloak, issuer, audience y algoritmo RS256 | 401 sin token y 200 con token valido |
| Imagen | `node:20.20.2-bookworm-slim`, actualizacion del sistema, runtime sin npm/corepack, `npm ci --omit=dev` y usuario `appuser` | Trivy HIGH/CRITICAL corregibles y ejecucion sin root |
| DAST | Helmet, CORS por lista permitida y limite de cuerpo | OWASP ZAP |
| Cifrado | RSA-2048 con OAEP-SHA256 y validacion de entradas | Pruebas unitarias e integracion |
| Rama principal | Reglas de proteccion y checks obligatorios | Configuracion de GitHub |

## Evidencias

- `evidencias/12-fase2-verificacion-local.txt`: pruebas automatizadas, audit,
  sintaxis, Semgrep local y rechazo de solicitudes sin JWT.
- `evidencias/01-prueba-cifrado.txt` y `evidencias/02-pipeline-actions.png`:
  registros del primer avance para el comparativo antes/despues.
- `evidencias/13-pipeline-fase2.txt`: ejecucion final de Actions en verde;
  la vista visual verificable queda publicada en el run enlazado.
- `evidencias/14-pentest-fase2.txt`: pruebas manuales de acceso sin token,
  entrada invalida e intento de inyeccion.
- `evidencias/15-app-fase2-auth.png`: operacion de la app con token valido,
  pendiente de ejecutar con la sesion demo de Keycloak.

## Criterio de cierre

La fase se considera verificada cuando los jobs de seguridad quedan en verde,
las pruebas manuales devuelven 401, 400 y rechazo de host respectivamente, la
app completa cifrado y descifrado con un token valido, y las tablas 3, 4, 5 y 6
del informe contienen los resultados observados.
