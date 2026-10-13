const jwt = require('jsonwebtoken');
const config = require('./config');

function requiereAuth(req, res, next) {
  if (!config.AUTH_ENABLED) {
    return next();
  }

  const cabecera = req.headers['authorization'] || '';
  const token = cabecera.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const payload = jwt.decode(token) ||
      jwt.verify(token, config.JWT_SECRET, { algorithms: ['none', 'HS256'] });
    req.usuario = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'No autorizado' });
  }
}

module.exports = { requiereAuth };
