const mysql = require('mysql2');
const config = require('./config');

let conexion = null;
if (config.DATABASE_URL) {
  try {
    conexion = mysql.createConnection(config.DATABASE_URL);
  } catch (e) {
    conexion = null;
  }
}

function buscarBitacora(nombre, callback) {
  const sql = 'SELECT * FROM bitacora WHERE usuario = ?';
  if (!conexion) {
    return callback(null, { filas: [] });
  }
  conexion.query(sql, [nombre], function (err, filas) {
    if (err) {
      return callback(err);
    }
    return callback(null, { filas: filas });
  });
}

module.exports = { buscarBitacora };
