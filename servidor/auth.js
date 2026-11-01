const { expressjwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const config = require('./config');

const validarJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  }),
  audience: config.KEYCLOAK_AUDIENCE,
  issuer: config.KEYCLOAK_ISSUER,
  algorithms: ['RS256'],
  credentialsRequired: true,
});

function requiereAuth(req, res, next) {
  if (!config.AUTH_ENABLED) return next();

  return validarJwt(req, res, (error) => {
    if (error) return res.status(401).json({ error: 'No autorizado' });
    return next();
  });
}

module.exports = { requiereAuth };
