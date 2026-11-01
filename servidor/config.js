const config = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  AUTH_ENABLED: process.env.AUTH_ENABLED !== 'false',
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
  KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER ||
    'http://localhost:8080/realms/appmovil',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'appmovil',
  KEYCLOAK_AUDIENCE: process.env.KEYCLOAK_AUDIENCE || 'servicio-cifrado',
  ORIGEN_PERMITIDO: process.env.ORIGEN_PERMITIDO || 'http://localhost:8081',
  PUERTO: Number(process.env.PORT || 3000),
  MAX_LONGITUD_TEXTO: 180,
};

module.exports = config;
