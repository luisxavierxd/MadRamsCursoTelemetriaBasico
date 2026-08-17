# Curso Telemetría — Nuevo Ingreso (sitio web)

Sitio estático del curso introductorio de electrónica para telemetría de MadRams (Minibaja SAE). Portada + 6 páginas de sesión, sin build step.

**Licencia:** MIT (ver [`LICENSE`](LICENSE)). Los modelos 3D (`assets/models/*.glb`, derivados de GrabCAD), el HDRI (CC0), el logo del equipo MadRams y las librerías por CDN conservan su propia licencia — detalle en `LICENSE`.

## Ver en local

Desde la raíz del proyecto:

    python -m http.server 8000

Abre `http://localhost:8000/`.

## Estructura

- `index.html` — portada con el temario.
- `sesiones/sesion-N.html` — shells que cargan `assets/js/data/sesion-N.js` (contenido) y `assets/js/session-template.js` (el que arma la página).
- `assets/js/data/sesion-N.js` — todo el contenido de la sesión: la **lección** explicativa (array `lesson` con bloques `concept` / `callout` / `diagram` / `lab`), la referencia rápida, errores, bibliografía, el `simulator` y el `model` 3D.
- `assets/js/session-template.js` — arma cada página desde los datos: hero + modelo 3D, lección (con el laboratorio embebido donde toca), referencia, y los **rieles laterales** (índice/scrollspy a la izquierda y telemetría demo con gráficas a la derecha, solo en pantallas ≥1360px).
- `assets/css/` — `tokens.css` (paleta/tipografía), `base.css` (componentes compartidos + fondos), `home.css`, `sesion.css` (lección, notas de profesor, rieles).
- `assets/js/animations.js` — animaciones Anime.js: traza de circuito, **fondo de Mónaco** (circuito centrado con punto de telemetría que da vueltas, con continuidad entre páginas vía `sessionStorage`), revelado al hacer scroll, contadores.
- `assets/js/sims/` — un módulo de simulador interactivo por sesión (`ohm-law`, `voltage-divider`, `onewire-temp`, `i2c-imu`, `gps-lora`) + `registry.js` (registro compartido y utilidades: reducedMotion, scrollRotate del modelo 3D, y `alarm` para las alertas catastróficas). `assets/css/sims.css` los estiliza.
- `assets/models/` — modelos 3D (`.glb`) de los componentes. Cada sesión referencia el suyo en `model.src`.
- `assets/img/LogoMadrams.png` — logo del equipo, usado en el header y como favicon del sitio.
- `assets/img/diagrams/` — diagramas esquemáticos (SVG) que se muestran inline en las lecciones (triángulo de Ohm, serie/paralelo, divisor, bus OneWire, bus I2C, ejes IMU, umbral de impacto, escalera ADC, SPI microSD, pipeline de telemetría). Algunos se marcan `wide: true` en los datos para renderizar más grandes.

## Publicar en GitHub Pages

Ya está desplegado en <https://luisxavierxd.github.io/CursoTelemetria/>. Para reproducirlo
desde cero:

1. Crea un repositorio en GitHub (puede ser `usuario.github.io` o cualquier otro nombre — el sitio usa rutas relativas, funciona igual como user-page o project-page).
2. Desde esta carpeta:

       git remote add origin <url-del-repo>
       git branch -M main
       git push -u origin main

3. En GitHub: Settings → Pages → Source: rama `main`, carpeta `/ (root)`.
4. Espera unos minutos; el sitio queda en `https://<usuario>.github.io/<repo>/` (o en la raíz si es un user-page).

## Simuladores

Cada sesión 1–5 incluye un simulador interactivo (sección "Laboratorio interactivo",
embebido dentro de la lección donde ayuda a explicar el tema; código en
`assets/js/sims/<sesion>.js`). Las alertas "catastróficas" (LED que explota en S1,
temperatura crítica en S3, impacto en S4, ángulo >25° en S2) usan `_util.alarm` /
efectos propios y respetan `prefers-reduced-motion`. La sesión 6 (proyecto abierto) no
lleva simulador ni modelo.

## Modelos 3D

El slot 3D del hero muestra un placeholder punteado hasta que la sesión define
`model.src`. Con un `.glb` se convierte en un visor `<model-viewer>` (CDN
`@google/model-viewer`, sin build) rotable con mouse/touch, con auto-rotación y giro
ligado al scroll de la sección.

**Estado:** ✅ Arduino Uno (S1) · ✅ Potenciómetro (S2) · ✅ DS18B20 (S3) · ✅ MPU6050 (S4) · ✅ GPS GY-NEO6MV2 (S5). Todos con iluminación de estudio (HDRI en `assets/models/env/`).

### Flujo de conversión CAD → `.glb` (probado con GrabCAD + SolidWorks)

1. En SolidWorks, **exporta como glTF (`.gltf`), NO como glTF Binary (`.glb`)**. El
   export `.glb` de SolidWorks salió **truncado** (solo el JSON, sin los datos binarios).
   El `.gltf` genera una carpeta con `.gltf` + un `.bin` (varios MB — la geometría) +
   los `.png` de textura si los hay. Verifica que el `.bin` pese **varios MB**.
2. Empaca y comprime a un `.glb` autónomo con Draco (resuelve el `.bin` y las texturas):

       npx gltf-pipeline -i Componente/Componente.gltf -o assets/models/Componente.glb -d

   Draco baja el tamaño ~95% (p. ej. Arduino: 9.8 MB → ~0.5 MB). `<model-viewer>` decodifica
   Draco de fábrica.
3. Cablea en `assets/js/data/sesion-N.js`:

       model: { label: 'Arduino Uno', alt: 'Modelo 3D de Arduino Uno', src: '../assets/models/ArduinoUno.glb' }

### Ajustes sin re-exportar (editando el `.glb` o atributos de model-viewer)

- **Texturas espejeadas:** agrega `KHR_texture_transform` a los materiales con textura
  (volteo en U → `offset [1,0] scale [-1,1]`; en V → `offset [0,1] scale [1,-1]`). Se edita
  el chunk JSON del `.glb` sin tocar la geometría Draco (el Arduino usa volteo en V).
- **Orientación:** añade `orientation` al `model` en los datos — se pasa a
  `<model-viewer>` como `"roll pitch yaw"`. Ej. potenciómetro: `orientation: '90deg 0deg 180deg'`.

## Estado y pendientes

Contenido, simuladores, diagramas, fondos, rieles, logo/favicon y los **5 modelos 3D**
están listos. El sitio está **publicado** en GitHub Pages:
<https://luisxavierxd.github.io/CursoTelemetria/>. Cada Teoría del Notion enlaza a su
sesión publicada. Pendiente:

- **Sesión 6** (proyecto abierto) no lleva simulador ni modelo 3D — es intencional; si se
  quiere algo ahí, es trabajo aparte.
- Actualizar los links de Notion en `assets/js/data/sesion-*.js` (`cta.url`) si las páginas
  de Práctica cambian de ubicación.
