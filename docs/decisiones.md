# Decisiones

Decisiones de negocio y técnicas relevantes de la app, con fecha y quién decidió.

| Fecha | Decisión | Quién |
|---|---|---|
| antes de oct 2026 | La app se construyó en GitHub Pages con Firestore (Firebase), antes de que existiera el playbook. En octubre de 2026 el repo ya vive en `Grupo-PROESA` | Jorge Anaya |
| 2026-09-25 | Se pide y cancela a cualquier hora, siempre del día siguiente en adelante | Talento Humano |
| 2026-10-07 | El turno de día elige la hora en que pasa por su comida | Talento Humano |
| 2026-10-20 | Login de colaboradores desde el portal con Cloud Function y custom token de Firebase (issue #2). El proyecto pasa a plan Blaze | Luis (TI), Jorge Anaya |
| 2026-10-21 | El acceso de colaboradores es desde el Gestor de Personal (Proesa-Teams), no desde el portal: el Gestor manda un token HS256 con el número de empleado (`HANDOFF_SECRET`). Sustituye a PROESA Gateway para esta app | Luis (TI) |
| 2026-10-21 | Reglas de Firestore: cada colaborador solo lee, pide, modifica y cancela su propio pedido. Comedor y RRHH con PIN | Jorge Anaya |
| 2026-10-21 | Los proyectos de Firebase pasan a la cuenta de empresa | Jorge Anaya |
| 2026-11-02 | Los lunes de 9:00 a 12:30 se puede pedir y cancelar la comida del mismo día | Talento Humano (Axel Ávila), Jorge Anaya |

Excepciones al playbook (R1, R2, R3, R5): ver `CLAUDE.md`. Aprobadas por Luis (TI) en octubre de 2026,
sin issue formal en el repo del playbook.
