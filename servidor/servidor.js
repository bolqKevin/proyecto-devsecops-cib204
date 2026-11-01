const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const net = require('net');
const { execFile } = require('child_process');
const cifrado = require('./cifrado');
const db = require('./db');
const config = require('./config');
const { requiereAuth } = require('./auth');

// CSRF no aplica: la API no usa cookies/sesiones y exige Authorization: Bearer.
// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
const app = express();
const llaves = cifrado.generarLlaves();
const origenesPermitidos = config.ORIGEN_PERMITIDO
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  const origen = req.headers.origin;
  if (origen && !origenesPermitidos.includes(origen)) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  return next();
});
app.use(cors({
  origin: (origen, callback) => callback(null, origen || false),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

function textoValido(valor) {
  return typeof valor === 'string' &&
    valor.trim().length > 0 &&
    valor.length <= config.MAX_LONGITUD_TEXTO;
}

function cifradoValido(valor) {
  return typeof valor === 'string' &&
    valor.length > 0 &&
    valor.length <= 1024 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(valor);
}

function esHostValido(host) {
  if (typeof host !== 'string' || host.length === 0 || host.length > 253) {
    return false;
  }
  if (net.isIP(host)) return true;
  return /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(host);
}

function evaluarExpresionSegura(expresion) {
  if (typeof expresion !== 'string' || expresion.length > 100) {
    throw new Error('Expresion invalida');
  }

  const limpia = expresion.replace(/\s/g, '');
  if (!limpia || !/^[0-9+\-*/().]+$/.test(limpia)) {
    throw new Error('Expresion invalida');
  }

  const tokens = limpia.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
  if (tokens.join('') !== limpia) throw new Error('Expresion invalida');

  const valores = [];
  const operadores = [];
  const precedencia = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const aplicar = () => {
    const operador = operadores.pop();
    const derecho = valores.pop();
    const izquierdo = valores.pop();
    if (typeof izquierdo !== 'number' || typeof derecho !== 'number') {
      throw new Error('Expresion invalida');
    }
    if (operador === '/' && derecho === 0) throw new Error('Expresion invalida');
    const resultado = operador === '+' ? izquierdo + derecho
      : operador === '-' ? izquierdo - derecho
        : operador === '*' ? izquierdo * derecho : izquierdo / derecho;
    if (!Number.isFinite(resultado)) throw new Error('Expresion invalida');
    valores.push(resultado);
  };

  let anterior = null;
  for (const token of tokens) {
    if (/^\d/.test(token)) {
      valores.push(Number(token));
    } else if (token === '(') {
      operadores.push(token);
    } else if (token === ')') {
      while (operadores.length && operadores[operadores.length - 1] !== '(') aplicar();
      if (operadores.pop() !== '(') throw new Error('Expresion invalida');
    } else {
      const esUnario = token === '-' &&
        (anterior === null || anterior === '(' || Object.prototype.hasOwnProperty.call(precedencia, anterior));
      if (esUnario) valores.push(0);
      while (operadores.length && operadores[operadores.length - 1] !== '(' &&
        precedencia[operadores[operadores.length - 1]] >= precedencia[token]) aplicar();
      operadores.push(token);
    }
    anterior = token;
  }

  while (operadores.length) {
    if (operadores[operadores.length - 1] === '(') throw new Error('Expresion invalida');
    aplicar();
  }
  if (valores.length !== 1) throw new Error('Expresion invalida');
  return valores[0];
}

app.get('/salud', (req, res) => {
  res.json({ estado: 'ok', version: '2.0.0' });
});

app.get('/llave', (req, res) => {
  res.json({ llavePublica: llaves.publicKey });
});

app.post('/cifrar', requiereAuth, (req, res) => {
  if (!textoValido(req.body?.texto)) {
    return res.status(400).json({ error: 'Texto invalido' });
  }
  try {
    const resultado = cifrado.cifrar(req.body.texto, llaves.publicKey);
    return res.json({ cifrado: resultado });
  } catch (error) {
    console.error('Error controlado en cifrado:', error.message);
    return res.status(500).json({ error: 'No se pudo cifrar el texto' });
  }
});

app.post('/descifrar', requiereAuth, (req, res) => {
  if (!cifradoValido(req.body?.cifrado)) {
    return res.status(400).json({ error: 'Cifrado invalido' });
  }
  try {
    const resultado = cifrado.descifrar(req.body.cifrado, llaves.privateKey);
    return res.json({ descifrado: resultado });
  } catch (error) {
    console.error('Error controlado en descifrado:', error.message);
    return res.status(400).json({ error: 'Cifrado invalido' });
  }
});

app.get('/buscar', (req, res) => {
  const nombre = req.query.nombre || '';
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre invalido' });
  }
  return db.buscarBitacora(nombre, (error, data) => {
    if (error) return res.status(500).json({ error: 'No se pudo consultar la bitacora' });
    return res.json(data);
  });
});

app.post('/calcular', (req, res) => {
  try {
    return res.json({ resultado: evaluarExpresionSegura(req.body?.expresion || '0') });
  } catch (error) {
    return res.status(400).json({ error: 'Expresion invalida' });
  }
});

app.get('/diagnostico', (req, res) => {
  const host = req.query.host || '127.0.0.1';
  if (!esHostValido(host)) return res.status(400).json({ error: 'Host invalido' });

  return execFile('ping', ['-c', '1', '-W', '2', host], {
    timeout: 3000,
    maxBuffer: 16 * 1024,
  }, (error, stdout, stderr) => {
    if (error) return res.status(502).json({ error: 'No se pudo completar el diagnostico' });
    return res.json({ salida: stdout, error: stderr });
  });
});

if (require.main === module) {
  app.listen(config.PUERTO, () => {
    console.log('Servicio de cifrado escuchando en el puerto ' + config.PUERTO);
    console.log('AUTH_ENABLED =', config.AUTH_ENABLED);
  });
}

module.exports = app;
