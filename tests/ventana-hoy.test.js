// Ventana especial solo del 2 nov 2026: de 9:00 a 12:30 (hora de Mexico) se pudo pedir la comida del mismo dia.
// Las reglas usan la hora real, asi que esta prueba revisa lo que toca segun el momento en que corre.
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc } = require('firebase/firestore');

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

// Funcion de la pagina, tal cual
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.match(/const VENTANA_HOY = .*\n/)[0] + html.match(/function enVentanaHoy\(\) \{.*\}/)[0];
const enVentanaEn = (iso) => {
  const RealDate = Date;
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [iso])); } }
  return new Function('Date', src + '\nreturn enVentanaHoy();')(FakeDate);
};

test('pagina: la ventana es solo el 2 nov 2026 de 9:00 a 12:30 hora de Mexico', () => {
  assert.equal(enVentanaEn('2026-11-02T14:59:00Z'), false); // 2 nov 8:59
  assert.equal(enVentanaEn('2026-11-02T15:00:00Z'), true);  // 2 nov 9:00
  assert.equal(enVentanaEn('2026-11-02T18:29:00Z'), true);  // 2 nov 12:29
  assert.equal(enVentanaEn('2026-11-02T18:30:00Z'), false); // 2 nov 12:30
  assert.equal(enVentanaEn('2026-11-03T16:00:00Z'), false); // martes 10:00
  assert.equal(enVentanaEn('2026-11-09T16:00:00Z'), false); // el lunes siguiente ya no
});

let env;
// Hoy en hora de Mexico (UTC-6)
const mx = new Date(Date.now() - 6 * 3600 * 1000);
const hoyNombre = NOMBRES[mx.getUTCDay()];
const ahoraEnVentana = enVentanaEn(new Date().toISOString());

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-menu-lans-ventana',
    firestore: { rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8') },
  });
  // Menu de un solo dia: hoy
  const menu = { mes: MESES[mx.getUTCMonth()], mesNum: mx.getUTCMonth() + 1, anio: mx.getUTCFullYear(), dias: [{ dia: hoyNombre, fecha: mx.getUTCDate() }] };
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'config/menu'), menu);
    await setDoc(doc(db, 'config/catalogo'), { '123': { nombre: 'Prueba' } });
  });
});
after(async () => env && env.cleanup());

test(`reglas: pedir hoy (${hoyNombre}) ${ahoraEnVentana ? 'SI' : 'NO'} se permite en este momento`, async () => {
  const p = mx.toISOString().slice(0, 10);
  const db = env.authenticatedContext('emp_123', { numEmp: '123' }).firestore();
  const pedido = { nombre: 'Prueba', numEmpleado: '123', semana: p, fecha: 'x', total: 1, detalle: { [hoyNombre]: 1 } };
  const intento = setDoc(doc(db, `pedidos/${p}_123`), pedido);
  await (ahoraEnVentana ? assertSucceeds(intento) : assertFails(intento));
});
