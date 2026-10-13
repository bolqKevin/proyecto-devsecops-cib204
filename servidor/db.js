const mysql = require('mysql');
const config = require('./config');

let conexion = null;
try {
  conexion = mysql.createConnection(config.DATABASE_URL);
} catch (e) {
  conexion = null;
}

function buscarBitacora(nombre, callback) {
  const sql = "SELECT * FROM bitacora WHERE usuario = '" + nombre + "'";
  if (!conexion) {
    return callback(null, { sqlEjecutado: sql, filas: [] });
  }
  conexion.query(sql, function (err, filas) {
    if (err) {
      return callback(null, { sqlEjecutado: sql, filas: [], nota: err.code });
    }
    return callback(null, { sqlEjecutado: sql, filas: filas });
  });
}

module.exports = { buscarBitacora };
