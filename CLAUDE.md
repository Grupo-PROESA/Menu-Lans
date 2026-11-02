# CLAUDE.md · Comedor LANS

> Esta app sigue el Playbook de Soluciones Digitales PROESA (instalado en
> `~/.claude/proesa-playbook/`). Aquí va solo lo específico de esta app.
> **Ojo:** está fuera del stack estándar por una excepción (ver *Excepciones al playbook*).

## Qué es

- **Proceso que resuelve:** pedidos de comida del comedor de LANS Laboratorios de Referencia. Cada
  colaborador pide y cancela su comida y la hora en que pasa, el comedor ve los pedidos por semana y
  Talento Humano saca los reportes de descuento (BUK) y conciliación con el proveedor.
- **Área dueña / dueño del proceso:** Talento Humano. Contacto en el área: Axel Ávila
- **Especialista responsable:** Jorge Anaya (Soluciones Digitales), supervisa el sistema de los dos comedores
- **Cómo se entra:** Portal PROESA → Proesa-Teams (Gestor de Personal) → menú **Comedor** →
  **Comedor LANS**. El proveedor del comedor entra directo a la URL con el botón ADMIN y su PIN.
- **URL:** https://comedor-lans.grupoproesa.mx · proyecto Firebase `menu-lans`
- **Código en el Gestor (`aud` del token):** `comedor-lans`

## Roles

No usa roles del portal. Se definen así:

| Rol | Quién lo tiene | Qué puede hacer |
|---|---|---|
| Colaborador | Quien entra desde Proesa-Teams (token con su `numEmp`) | Pedir, ver y cancelar **solo su** pedido de la semana |
| Comedor (`adminPin`) | El proveedor del comedor | Editar el menú y ver todos los pedidos |
| RRHH (`superPin`) | Talento Humano | Todo: cortesías, catálogo (incluido turno nocturno), reportes, registrar o borrar pedidos de otros |

Los PIN viven en Firestore `config/secrets` y se validan en `firestore.rules` al crear
`admin_sessions/{uid}`. La sesión de admin dura 12 h.

## Vocabulario del área

| Término | Significado |
|---|---|
| Pedido semanal | `pedidos/{semana}_{numEmp}`: los días, guisado, guarnición y hora en que pasa. `semana` es la fecha del primer día del menú |
| Turno nocturno | Colaboradores marcados `turno: noche` en el catálogo. Su comida va en contenedor rotulado, sin hora |
| Cortesía | Comida para alguien sin número de empleado. Solo RRHH la registra |
| Catálogo | Lista de números de empleado con nombre (y turno). Sin estar en el catálogo no se puede pedir |
| Formato anterior | `orders/{numEmp}`, de la semana del 5 de octubre de 2026 (`SEMANA_LEGADO`). Solo lectura |

## Reglas de negocio clave

- **Pedir y cancelar a cualquier hora, siempre del día siguiente en adelante.** El día de hoy nunca se
  agrega ni se quita (lo valida `firestore.rules` en hora de México). Acordado con Talento Humano el
  25 sep 2026.
- **Excepción de una sola vez (2 nov 2026):** ese día, de 9:00 a 12:30, se pudo pedir y cancelar la
  comida del mismo día por un problema con el menú. Pedido de Talento Humano (Axel Ávila). Queda en
  `ventanaEspecialHoy()` (`firestore.rules`) y `enVentanaHoy()` (`index.html`), ya sin efecto.
- **Hora en que pasa:** el turno de día elige por día una hora de 12:30 a 22:00, cada media hora
  (`HORARIOS_RECOGER`, pedido de Talento Humano del 7 oct 2026).
- **Pedidos por semana que no se borran:** cada semana queda guardada y el panel elige la semana.
- **Precios de reportes** en `index.html`: `PRECIO_DESCUENTO_COLABORADOR`, `PRECIO_BASE_PROVEEDOR`,
  `IVA_RATE`.

## Integraciones

No ofrece datos a otras apps (ver `docs/contrato.md`). Lo que **consume**:

| Necesito | De qué app | Cómo |
|---|---|---|
| Quién es el colaborador y su número | Gestor de Personal (Proesa-Teams) | El Gestor redirige a la Function `ssoCallback` con `?t=<JWT HS256>` (`iss` `gestor-personal`, `aud` `comedor-lans`), firmado con el secreto `HANDOFF_SECRET` |

## Dónde va cada cosa (no cambiar sin razón)

- Toda la interfaz y su lógica: `index.html`, estilos comunes en `proesa.css`.
- Reglas de acceso a los datos: `firestore.rules` (`firebase deploy --only firestore:rules`).
- Entrada desde el Gestor: `functions/index.js` (Cloud Function `ssoCallback`, Node 22, 2nd gen).
- Carga del catálogo y turnos nocturnos: `setup/cargar_catalogo.mjs`, `setup/marcar_nocturnos.mjs`.
- Pruebas: `tests/rules.test.js` (reglas, emulador de Firestore) y `tests/ventana-hoy.test.js`.
- Publicación: GitHub Pages publica `main` solo. La Function y las reglas se despliegan a mano con
  firebase CLI (ver README, sección 6).

## Excepciones al playbook

- **Stack y hosting fuera del estándar (R1, R2, R3):** página estática en GitHub Pages con Firestore
  y Cloud Functions de Firebase, sin backend FastAPI ni PostgreSQL. La app ya existía así.
- **Login por el Gestor en lugar de PROESA Gateway (R5):** el acceso de colaboradores lo diseñó y
  aprobó TI (Luis) en octubre de 2026 (issue #2).

Detalle y fechas en `docs/decisiones.md`. La excepción la aprobó Luis (TI) en octubre de 2026, sin
issue formal en el repo del playbook.

## Deuda conocida

- Sin CI: ningún PR corre pruebas automáticas.
- Sin ayuda embebida (recorrido, `?` por pantalla, `/ayuda`).
- Sin deploy automático para la Function y las reglas.
- El catálogo se captura a mano y no se sincroniza con BUK ni con el Gestor: los ingresos no pueden
  pedir hasta que RRHH los agrega.
