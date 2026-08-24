window.SESSION_DATA = {
  slug: 'sesion-5',
  number: '05',
  icon: '📐',
  title: 'Bus I²C: IMU (MPU6050) y Encoder (AS5600)',
  quote: 'Dos dispositivos de distintos fabricantes en un solo bus: el scanner I²C y la resolución del wrap-around al calcular RPM.',
  badges: [
    '1:30h (25 min teoría / 65 min práctica)',
    'MPU6050 (0x68) chasis + AS5600 (0x36) encoder RPM',
    'I²C Scanner, registro RAW ANGLE y detección de impacto'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788356',
    titulo: 'MadRams S5 · Bus I2C: MPU6050 + AS5600'
  },

  simulator: {
    type: 'i2c-imu',
    title: 'Laboratorio interactivo: bus I²C, direcciones y umbral de impacto',
    caption: 'Compara dos dispositivos en el mismo bus I²C (MPU6050 en 0x68 y AS5600 en 0x36). Inclina el chasis para disparar la detección de impacto y simula el cálculo de RPM.'
  },

  model: {
    label: 'IMU MPU-6050 y Encoder AS5600',
    alt: 'Modelo 3D del sensor IMU MPU-6050 de 6 grados de libertad',
    src: '../../assets/models/MPU6050.glb',
    orientation: '0deg 0deg 202deg',
    specs: [
      { k: 'Bus de comunicación', v: '<span class="hl">I²C (SDA / SCL) a 100/400 kHz</span>' },
      { k: 'Dispositivo 1 (IMU)', v: 'InvenSense MPU-6050 (dirección <strong>0x68</strong> vía AD0 a GND)' },
      { k: 'Dispositivo 2 (Encoder)', v: 'ams-OSRAM AS5600 (dirección fija <strong>0x36</strong>)' },
      { k: 'Rango acelerómetro', v: '±2g / ±4g / ±8g / ±16g (ADC 16 bits)' },
      { k: 'Resolución encoder', v: '12 bits sin contacto (0 a 4095 pasos por vuelta de 360°)' },
      { k: 'Uso en MadRams', v: 'IMU: dinámicas/vuelco · AS5600: tacómetro RPM CVT' },
      { k: 'Ventaja en Baja SAE', v: 'Sin contacto mecánico: 100% inmune a lodo, agua y vibración' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'Conexión con MadRams: dos sensores vitales en el mismo bus',
      body: 'En el chasis de MadRams conviven dos sensores I²C esenciales: el <strong>IMU MPU6050</strong> (dirección <span class="value-hl">0x68</span>) en el centro de gravedad para registrar fuerzas G e impacto, y el <strong>encoder magnético AS5600</strong> (dirección <span class="value-hl">0x36</span>) en la polea conducida de la CVT para calcular RPM. Ambos comparten exactamente las mismas dos líneas (SDA y SCL). El microcontrolador sabe a quién le habla porque cada integrado responde únicamente a su propia dirección de 7 bits.'
    },

    {
      type: 'concept',
      heading: 'El bus I²C: dos líneas (SDA/SCL) y direccionamiento maestro-esclavo',
      body: [
        'El protocolo <strong>I²C (Inter-Integrated Circuit)</strong> conecta múltiples periféricos usando solo dos líneas compartidas:',
        '• <code>SDA (Serial Data):</code> Línea bidireccional por donde viajan las tramas de datos y comandos.',
        '• <code>SCL (Serial Clock):</code> Línea de reloj generada por el maestro (microcontrolador) para sincronizar la lectura de cada bit.',
        'Cada chip en el bus tiene una <strong>dirección única de 7 bits</strong> (0x08 a 0x77). Cuando el maestro inicia una comunicación, envía primero la dirección del dispositivo con el que desea hablar; solo el chip cuya dirección coincida responderá con un bit de <strong>ACK (Acknowledge)</strong>, mientras que todos los demás ignoran el resto del mensaje.'
      ],
      diagram: {
        src: '../../assets/img/diagrams/i2c-bus.svg',
        alt: 'Topología del bus I2C con MPU6050 y AS5600 compartiendo SDA y SCL',
        caption: 'Topología I²C: MPU6050 (0x68) y AS5600 (0x36) comparten SDA/SCL; el microcontrolador los selecciona por dirección.',
        wide: true
      },
      teacher: 'SDA es la voz y SCL es el metrónomo. Enfatiza que las direcciones las define el fabricante del chip en el datasheet y no las inventamos nosotros.'
    },

    {
      type: 'concept',
      heading: 'El Scanner I²C: la herramienta de diagnóstico número uno',
      body: [
        'El <strong>I²C Scanner</strong> es un pequeño sketch en C++ que barre todas las 127 direcciones posibles del bus enviando una solicitud y escuchando el bit de ACK.',
        'Si el scanner detecta <code>0x68</code> y <code>0x36</code>, confirma de inmediato que la alimentación, las líneas SDA/SCL y las resistencias pull-up del bus están en perfecto estado.',
        'Si el scanner no encuentra nada o se congela, sabemos al 100% que existe un problema de hardware (SDA y SCL invertidos, falta de GND común o cable trozado) antes de perder horas revisando código complejo.'
      ],
      teacher: 'Haz que los alumnos corran el scanner I²C como primer paso de toda práctica. Es la prueba reina en inspección técnica antes de carrera.'
    },

    {
      type: 'concept',
      heading: 'El encoder magnético AS5600 y el problema del wrap-around',
      body: [
        'A diferencia de los potenciómetros que tienen topes mecánicos y sufren desgaste por fricción, el <strong>AS5600</strong> mide el ángulo de un imán diametral giratorio <strong>sin ningún contacto físico</strong>. Esto lo hace invulnerable al lodo, tierra, agua y vibración extrema de Baja SAE.',
        'El AS5600 entrega la posición absoluta en su registro <code>RAW ANGLE</code> de 12 bits (<span class="value-hl">0 a 4095 pasos</span> por cada vuelta de 360°).',
        '<strong>El reto del wrap-around (paso por cero):</strong> Al girar continuamente para calcular RPM, el sensor pasa bruscamente de <code>4095</code> a <code>0</code> (o de 0 a 4095 si gira en reversa). Si calculas la diferencia con una resta simple <code>delta = actual - anterior</code>, obtendrás un salto erróneo de <code>-4095</code> pasos que arruina el cálculo de velocidad.',
        'La solución matemática es corregir el salto de cuadrante: si <code>delta &lt; -2048</code>, sumamos 4096; si <code>delta &gt; 2048</code>, restamos 4096.'
      ],
      teacher: 'Dibuja en el pizarrón el círculo de 0 a 4095 y muestra por qué el cruce 4095→0 da un delta aparente de -4095 cuando en realidad el eje solo avanzó +1 paso.'
    },

    {
      type: 'concept',
      heading: 'IMU MPU6050: aceleraciones, gravedad y umbrales de impacto',
      body: [
        'El <strong>MPU6050</strong> integra un acelerómetro de 3 ejes (X, Y, Z) y un giroscopio de 3 ejes. La aceleración se lee en unidades de gravedad (g) o en <code>m/s²</code>.',
        '<strong>Check de cordura:</strong> Con el coche detenido sobre sus 4 ruedas en superficie plana, el eje vertical (Z) debe medir siempre <span class="value-hl">≈ 9.8 m/s² (1.0 g)</span> debido a la gravedad terrestre. Si marca 0 en todos los ejes, el sensor no está leyendo.',
        'Para detectar impactos o volcaduras (rollover), calculamos la magnitud total del vector de aceleración <code>|a| = √(ax² + ay² + az²)</code> y disparamos una bandera de alarma si supera el umbral crítico configurado (ej. &gt; 3.5 g).'
      ],
      diagram: {
        src: '../../assets/img/diagrams/accelerometer-axes.svg',
        alt: 'Ejes espaciales X, Y, Z del acelerómetro y vector de aceleración',
        caption: 'Tres ejes ortogonales de aceleración; en reposo, el eje vertical mide la gravedad terrestre.'
      }
    },

    {
      type: 'lab',
      heading: 'Pruébalo: escaneo de bus I²C y detección de impacto'
    }
  ],

  decisionTable: {
    caption: 'Comparativa de dispositivos y sensores en bus I²C para telemetría',
    headers: ['Dispositivo', 'Dirección I²C', 'Función en el vehículo', 'Configuración de dirección', 'Consideración clave'],
    rows: [
      ['IMU MPU-6050', '0x68 / 0x69', 'Dinámica de chasis, aceleración y detección de volcadura', 'Pin AD0 a GND = 0x68; Pin AD0 a VCC = 0x69', 'Permite máximo 2 chips en el mismo bus'],
      ['Encoder AS5600', '0x36 (fija)', 'Tacómetro de RPM en motor y eje secundario de CVT', 'Fija en hardware (no modificable)', 'Requiere multiplexor TCA9548A si se usan más de 1 en el mismo bus'],
      ['Sensor de presión BMP280', '0x76 / 0x77', 'Presión barométrica y altimetría', 'Pin SDO a GND = 0x76; a VCC = 0x77', 'Muy sensible a ráfagas directas de viento'],
      ['Multiplexor TCA9548A', '0x70 a 0x77', 'Expansor para conectar hasta 8 buses I²C independientes', 'Pines A0, A1, A2 configurables', 'Permite conectar múltiples AS5600 (0x36) sin colisión de dirección']
    ]
  },

  reference: {
    intro: 'El bus I²C opera con niveles lógicos estándar (3.3V en ESP32). Cada transacción inicia con una condición START (SDA cae mientras SCL está en HIGH) y concluye con una condición STOP.',
    formulas: [
      {
        label: 'Corrección de wrap-around (paso por cero) en encoder AS5600 de 12 bits',
        code: 'int delta = anguloActual - anguloAnterior;\nif (delta < -2048) delta += 4096; // Cruce hacia adelante 4095 → 0\nelse if (delta > 2048) delta -= 4096; // Cruce hacia atrás 0 → 4095\nanguloAnterior = anguloActual;'
      },
      {
        label: 'Cálculo de RPM a partir de delta de pasos de 12 bits',
        code: 'float revoluciones = (float)delta / 4096.0;\nfloat rpm = (revoluciones / dt_segundos) * 60.0;'
      },
      {
        label: 'Magnitud vectorial de aceleración total para detección de impacto',
        code: 'float magnitud = sqrt(ax*ax + ay*ay + az*az);\nif (magnitud > UMBRAL_IMPACTO_G) {\n  dispararAlertaImpacto();\n}'
      }
    ],
    tables: [
      {
        caption: 'Mapa de registros principales del encoder ams AS5600',
        headers: ['Registro', 'Dirección Hex', 'Bits útiles', 'Descripción'],
        rows: [
          ['RAW ANGLE (Alto/Bajo)', '0x0C y 0x0D', '12 bits (0..4095)', 'Ángulo absoluto no filtrado del imán diametral'],
          ['ANGLE (Alto/Bajo)', '0x0E y 0x0F', '12 bits (0..4095)', 'Ángulo con filtro digital interno y corrección de histéresis'],
          ['STATUS', '0x0B', '3 bits (MD, ML, MH)', 'Detección de imán: MD (imán detectado), ML (muy lejos), MH (muy cerca)']
        ]
      }
    ]
  },

  errors: [
    'Conflicto de dirección I²C (dos chips con la misma dirección en el mismo bus): ambos transmiten a la vez, corrompen los datos y el bus se congela esperando ACK.',
    'Invertir las líneas SDA y SCL: el bus no sufre daño eléctrico, pero ningún dispositivo responderá y el I²C Scanner devolverá 0 dispositivos encontrados.',
    'No resolver el wrap-around en el cálculo de RPM: en cada vuelta completa de la polea se produce un pico falso de -60,000 RPM que arruina las gráficas de telemetría.',
    'Alejar el imán diametral más de 2 mm del chip AS5600: el registro STATUS reportará ML (Magnet too Low) y las lecturas de ángulo perderán precisión.'
  ],

  deliverable: {
    title: 'Práctica Wokwi: Bus I²C con IMU y Encoder AS5600',
    items: [
      'Link público al proyecto Wokwi con MPU6050 y AS5600 conectados al mismo bus I²C de un ESP32/Arduino.',
      'Captura de pantalla de la salida del monitor serial mostrando la ejecución exitosa del I²C Scanner identificando 0x68 y 0x36.',
      'Lectura simultánea de aceleración (con detección de impacto) y cálculo continuo de RPM con algoritmo anti-wrap-around.',
      'README en el proyecto explicando cómo se resuelve el problema de paso por cero (0↔4095) en el encoder.'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'Identificación correcta de direcciones I²C y diagnóstico mediante I²C Scanner ', weight: '30%' },
    { criterion: 'Implementación matemática de la corrección de wrap-around (paso por cero) para RPM ', weight: '25%' },
    { criterion: 'Lectura de aceleración vectorial e implementación del umbral de impacto ', weight: '25%' },
    { criterion: 'Código C++ estructurado, constantes nombradas y comentarios técnicos claros ', weight: '20%' }
  ],

  bibliography: [
    'ams-OSRAM AG (2021) — AS5600 12-Bit Programmable Contactless Magnetic Potentiometer Datasheet (DS000355).',
    'InvenSense / TDK (2013) — MPU-6000 and MPU-6050 Product Specification (Revision 3.4).',
    'NXP Semiconductors (2021) — UM10204: I2C-bus specification and user manual (Rev. 7.0).',
    'SparkFun Electronics (2020) — I2C Communication Architecture and Bus Troubleshooting Guide.'
  ],


  prev: { label: '04 · Temperatura (DS18B20 + 1-Wire)', url: '../sesion-4/' },
  cta: { label: 'Abrir esta sesión en Notion →', url: 'https://balsam-ringer-081.notion.site/3a5b2fdbb6b9812b84a0db75b914f7d1' },
  next: { label: '06 🏁 · GPS + MicroSD (Data Day)', url: '../sesion-6/' }
};
