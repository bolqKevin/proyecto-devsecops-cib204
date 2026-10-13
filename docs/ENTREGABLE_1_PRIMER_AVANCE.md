# CIB-204 - Entregable 1: Primer Avance

**Proyecto:** App móvil de cifrado con pipeline DevSecOps
**Curso:** CIB-204 Seguridad en Aplicaciones Móviles
**Fecha de preparación:** 2026-10-12
**Estado:** avance ejecutado y evidencias cloud verificadas; el pipeline conserva los fallos esperados del baseline inseguro.

## 1. Alcance del avance

Este primer avance documenta los requisitos de seguridad, el modelo STRIDE, la
arquitectura y la prueba funcional inicial del proyecto inseguro. En esta fase
no se corrigen todavía las vulnerabilidades: el pipeline debe mostrar el estado
inicial del laboratorio.

## 2. Tabla 1 - Requisitos de seguridad

| Propiedad | Requisito | Control que lo implementa | Como se verifica | Estado inicial |
|---|---|---|---|---|
| Confidencialidad | El texto debe cifrarse antes de enviarse o almacenarse. | Servicio RSA con llave publica y privada; objetivo de remediacion: RSA-2048 con OAEP-SHA256. | Cifrar y descifrar recuperando el texto original; prueba DAST. | Funcional, pero el baseline usa RSA-1024 con PKCS#1 v1.5. |
| Integridad | Un texto cifrado alterado no debe descifrarse como si fuera valido. | Validacion del ciphertext, manejo seguro de errores y OAEP. | Manipular el ciphertext y comprobar rechazo sin exponer detalles internos. | Requisito definido; pendiente de remediacion y evidencia. |
| Disponibilidad | La API debe mantenerse disponible frente a entradas vacias, malformadas o demasiado grandes. | Validacion de tipo y longitud; limite de 1 a 180 caracteres; respuestas controladas. | Probar entrada vacia, entrada larga y JSON invalido. | La version inicial no valida tipo ni tamano. |
| Autenticacion | Solo usuarios validos deben usar las operaciones de cifrado. | Keycloak como IAM y tokens JWT verificados con firma RS256. | Solicitar `/cifrar` sin token y con token valido; esperar 401 y 200 respectivamente. | El control arranca desactivado y el JWT inicial pertenece a la línea base insegura. |

## 3. Tabla 2 - Amenazas STRIDE

| Amenaza | Componente afectado | Ejemplo de ataque | Control o mitigacion |
|---|---|---|---|
| Spoofing (suplantacion) | API de cifrado e IAM | Consumir `/cifrar` sin identidad o fabricar un JWT. | Keycloak, validacion de firma RS256, issuer, audience y expiracion; responder 401 sin token valido. |
| Tampering (manipulacion) | Datos en transito y ciphertext | Alterar el texto cifrado antes de enviarlo a `/descifrar`. | OAEP, validacion del formato, rechazo seguro y HTTPS en el despliegue. |
| Repudiation (repudio) | Servicio y bitacora | Negar que se ejecuto una operacion de cifrado o consulta. | Bitacora con usuario, operacion, fecha/hora y resultado; logs del servicio. |
| Information disclosure (divulgacion) | Servicio, repositorio y errores | Leer secretos versionados o recibir stack traces. | Variables de entorno, `.gitignore` para secretos, Gitleaks y errores genericos sin stack. |
| Denial of service (denegacion) | API de cifrado | Enviar cuerpos enormes o tipos inesperados repetidamente. | Limite de tamano, validacion de entrada, respuestas 400 y controles de disponibilidad. |
| Elevation of privilege (elevacion) | Contenedor | Ejecutar comandos dentro del contenedor como root. | Imagen `node:20-slim`, usuario sin privilegios `appuser`, `.dockerignore` y permisos minimos. |

## 4. Jerarquia de diseno

1. **App movil (`app-movil/`)**: cliente Expo/React Native que captura el texto,
   solicita el token cuando el IAM esta activo y consume la API.
2. **Servicio de cifrado (`servidor/`)**: API Node.js con endpoints `/salud`,
   `/cifrar`, `/descifrar` y endpoints demostrativos del laboratorio.
3. **IAM (`docker-compose.yml`)**: Keycloak entrega y valida tokens JWT para el
   realm `appmovil` y el cliente `servicio-cifrado`.
4. **Pipeline (`.github/workflows/devsecops.yml`)**: ejecuta SAST, secretos,
   SCA, analisis de imagen/SBOM y DAST en cada cambio.

Flujo funcional: usuario -> app movil -> API de cifrado -> Keycloak para validar
identidad. El pipeline revisa el conjunto completo en cada push.

## 5. Evidencias del Primer Avance

| ID | Evidencia requerida | Estado | Archivo o accion |
|---|---|---|---|
| E-01 | Repositorio con el material y pipeline inicial en Actions. | Verificada | [Repositorio GitHub](https://github.com/bolqKevin/proyecto-devsecops-cib204) y [ejecución #1](https://github.com/bolqKevin/proyecto-devsecops-cib204/actions/runs/38329049545). |
| E-02 | Versiones de Node, npm, Docker y Docker Compose. | Verificada | [09-versiones-entorno.png](../evidencias/09-versiones-entorno.png): Node `v24.21.0`, npm `11.19.0`, Docker `29.8.0-1`, Compose `v5.5.1`. El devcontainer declara Node 20, pero la sesión efectiva mostró Node 24. |
| E-03 | Prueba de cifrado y descifrado con resultado coincidente. | Verificada | [01-prueba-cifrado.txt](../evidencias/01-prueba-cifrado.txt) y [05-app-cifrado-descifrado.png](../evidencias/05-app-cifrado-descifrado.png). |
| E-04 | `npm test` con 6 pruebas aprobadas. | Verificada | Codespace: `2` suites y `6` pruebas aprobadas; salida registrada en [03-evidencias-cloud.txt](../evidencias/03-evidencias-cloud.txt). |
| E-05 | Contenedores activos y `/salud` respondiendo `estado=ok`. | Verificada | [04-stack-salud.png](../evidencias/04-stack-salud.png) y [01-puerto-3000-publico.png](../evidencias/01-puerto-3000-publico.png). |
| E-06 | Keycloak: realm, cliente y usuario `demo`. | Verificada | Capturas [06-keycloak-realm.png](../evidencias/06-keycloak-realm.png), [07-keycloak-client.png](../evidencias/07-keycloak-client.png) y [08-keycloak-user.png](../evidencias/08-keycloak-user.png); API administrativa: realm, cliente y usuario creados con HTTP 201. |
| E-07 | App cifrando y descifrando con estados `Cifrado OK` y `Descifrado OK`. | Verificada | [05-app-cifrado-descifrado.png](../evidencias/05-app-cifrado-descifrado.png), contra el endpoint público de 3000. |

## 6. Resultados verificables

La prueba directa del modulo RSA fue ejecutada con el material entregado:

```text
Original : Hola mundo seguro CIB-204
Cifrado  : [valor variable generado en cada ejecucion]
Descifrado: Hola mundo seguro CIB-204
coincide = true
```

La bitácora de evidencias cloud registra las salidas observadas en Codespaces,
GitHub Actions, Keycloak y Expo. Los fallos de Semgrep, Gitleaks, SCA y Trivy
son deliberados: corresponden al baseline inseguro de la Fase 1 y no se
remedian en este entregable.

## 7. Verificación del alcance

- Repositorio público `proyecto-devsecops-cib204` con `.github/` y `.devcontainer/`.
- Ejecución inicial de GitHub Actions documentada en [02-pipeline-actions.png](../evidencias/02-pipeline-actions.png).
- Página Code del repositorio documentada en [10-github-repositorio.png](../evidencias/10-github-repositorio.png).
- Jerarquía, árbol y subsistemas documentados en [jerarquia_diseno.md](jerarquia_diseno.md).
- Pruebas de `npm install`, `node prueba.js` y `npm test` registradas.
- Servicios Docker y endpoint `/salud` documentados en [04-stack-salud.png](../evidencias/04-stack-salud.png).
- Realm, cliente y usuario de Keycloak documentados en [06-keycloak-realm.png](../evidencias/06-keycloak-realm.png), [07-keycloak-client.png](../evidencias/07-keycloak-client.png) y [08-keycloak-user.png](../evidencias/08-keycloak-user.png).
- Flujo de cifrado y descifrado en Expo documentado en [05-app-cifrado-descifrado.png](../evidencias/05-app-cifrado-descifrado.png).
