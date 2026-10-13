const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const cifrado = require('./cifrado');
const db = require('./db');
const config = require('./config');
const { requiereAuth } = require('./auth');

const app = express();
app.use(express.json());
app.use(cors());

const llaves = cifrado.generarLlaves();

app.get('/salud', (req, res) => {
  res.json({ estado: 'ok', version: 'inseguro-1.0' });
});

app.get('/llave', (req, res) => {
  res.json({ llavePublica: llaves.publicKey });
});

app.post('/cifrar', requiereAuth, (req, res) => {
  try {
    const texto = req.body.texto;
    const resultado = cifrado.cifrar(texto, llaves.publicKey);
    res.json({ cifrado: resultado });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.post('/descifrar', requiereAuth, (req, res) => {
  try {
    const cifradoTxt = req.body.cifrado;
    const resultado = cifrado.descifrar(cifradoTxt, llaves.privateKey);
    res.json({ descifrado: resultado });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

app.get('/buscar', (req, res) => {
  const nombre = req.query.nombre || '';
  db.buscarBitacora(nombre, (err, data) => {
    res.json(data);
  });
});

app.post('/calcular', (req, res) => {
  const expresion = req.body.expresion || '0';
  try {
    const resultado = eval(expresion);
    res.json({ resultado });
  } catch (e) {
    res.status(400).json({ error: 'Expresion invalida' });
  }
});

app.get('/diagnostico', (req, res) => {
  const host = req.query.host || '127.0.0.1';
  exec('ping -c 1 ' + host, (err, stdout, stderr) => {
    res.json({ salida: stdout, error: stderr });
  });
});

if (require.main === module) {
  app.listen(config.PUERTO, () => {
    console.log('Servicio de cifrado escuchando en el puerto ' + config.PUERTO);
    console.log('AUTH_ENABLED =', config.AUTH_ENABLED);
  });
}

module.exports = app;
