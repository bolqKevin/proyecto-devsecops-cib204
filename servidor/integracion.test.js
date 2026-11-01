// Pruebas de INTEGRACION de la API (Jest + supertest)
process.env.AUTH_ENABLED = 'false';
const request = require('supertest');
const app = require('./servidor');

describe('API del servicio de cifrado', () => {
  test('GET /salud responde estado ok', async () => {
    const res = await request(app).get('/salud');
    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('ok');
  });

  test('GET /llave entrega la llave publica', async () => {
    const res = await request(app).get('/llave');
    expect(res.statusCode).toBe(200);
    expect(res.body.llavePublica).toContain('BEGIN PUBLIC KEY');
  });

  test('ciclo completo: /cifrar y luego /descifrar recupera el texto', async () => {
    const texto = 'Prueba de integracion';
    const c = await request(app).post('/cifrar').send({ texto });
    expect(c.statusCode).toBe(200);
    expect(c.body.cifrado).toBeDefined();

    const d = await request(app)
      .post('/descifrar')
      .send({ cifrado: c.body.cifrado });
    expect(d.statusCode).toBe(200);
    expect(d.body.descifrado).toBe(texto);
  });

  test('rechaza entradas vacias o demasiado largas', async () => {
    const vacio = await request(app).post('/cifrar').send({ texto: '' });
    const largo = await request(app).post('/cifrar').send({ texto: 'x'.repeat(181) });
    expect(vacio.statusCode).toBe(400);
    expect(largo.statusCode).toBe(400);
  });

  test('evalua expresiones numericas sin ejecutar codigo', async () => {
    const valido = await request(app).post('/calcular').send({ expresion: '2 + 3 * 4' });
    const malicioso = await request(app).post('/calcular')
      .send({ expresion: 'process.exit()' });
    expect(valido.statusCode).toBe(200);
    expect(valido.body.resultado).toBe(14);
    expect(malicioso.statusCode).toBe(400);
  });

  test('rechaza hosts que no cumplen el formato permitido', async () => {
    const res = await request(app).get('/diagnostico').query({ host: '8.8.8.8;id' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Host invalido');
  });
});
