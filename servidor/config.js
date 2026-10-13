const config = {
  AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  JWT_SECRET: 'sup3r-s3cr3t0-cib204-no-lo-cambies',
  DATABASE_URL: 'mysql://root:Admin1234@localhost:3306/appmovil',
  AUTH_ENABLED: process.env.AUTH_ENABLED === 'true' ? true : false,
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || 'appmovil',
  PUERTO: process.env.PORT || 3000,
};

module.exports = config;
