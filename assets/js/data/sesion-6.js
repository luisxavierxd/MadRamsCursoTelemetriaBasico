window.SESSION_DATA = {
  slug: 'sesion-6',
  number: '06',
  icon: '🏁',
  title: 'GPS + MicroSD (Data Day)',
  quote: 'Cierre del curso: el nodo de adquisición armado, captura real de datos en microSD y entrega de tu primer análisis de corrida.',
  badges: [
    '1:30h (25 min teoría / 65 min armado y captura)',
    'Adquisición y logging a bordo (GPS + microSD)',
    'Entregable: CSV crudo + 3 hallazgos defendibles'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788357',
    titulo: 'MadRams S6 · Telemetría GPS + Registro en microSD'
  },

  simulator: {
    type: 'gps-lora',
    title: 'Laboratorio interactivo: sentencias NMEA y registro en microSD',
    caption: 'El vehículo recorre el circuito: analiza las tramas GPS generadas en tiempo real y cómo se estructuran los registros en el archivo CSV de la tarjeta de memoria.'
  },

  model: {
    label: 'Módulo GPS u-blox y Logging microSD',
    alt: 'Modelo 3D del módulo GPS con antena de parche y zócalo de microSD',
    src: '../assets/models/GPS_NEO6.glb',
    orientation: '-90deg 0deg -45deg',
    specs: [
      { k: 'Módulo GNSS', v: 'u-blox MAX-M10S (concurrencia GPS, GLONASS, Galileo, BeiDou)' },
      { k: 'Almacenamiento local', v: '<span class="hl">microSD SPI formateada en FAT32 (10 Hz)</span>' },
      { k: 'Protocolo GPS', v: 'Sentencias NMEA 0183 ($GNRMC, $GNGGA a 9600/38400 baud)' },
      { k: 'Tiempo de fix (Cold Start)', v: '&lt; 28 s al aire libre (mínimo 4 satélites)' },
      { k: 'Transmisión de radio', v: 'Vista previa conceptual (LoRa 915 MHz — tema del Curso Avanzado)' },
      { k: 'Objetivo de la sesión', v: 'Captura real de telemetría y entrega del dataset de carrera' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'El cierre del curso básico: tu primer dato real de carrera',
      body: 'A lo largo de las sesiones anteriores programaste y calibraste cada sensor individualmente: el termostato con histéresis, la suspensión por divisor de voltaje, la temperatura con OneWire y la IMU con el encoder por I²C. Hoy ensamblamos el <strong>nodo de adquisición completo</strong>: integramos el módulo GPS y la memoria microSD para realizar la captura oficial de datos de una corrida (<strong>Data Day</strong>) y generar tu entregable final de curso.'
    },

    {
      type: 'concept',
      heading: 'GPS y el estándar NMEA 0183',
      body: [
        'El módulo receptor GNSS escucha señales de satélites en órbita y triangula la posición geográfica, velocidad sobre el terreno y altitud.',
        'La información se transmite al microcontrolador a través de un puerto serie (UART a 9600 o 38400 baudios) formateada en sentencias estándar <strong>NMEA 0183</strong>:',
        '• <code>$GPRMC / $GNRMC:</code> Sentencia de navegación mínima recomendada (hora UTC, latitud, longitud, velocidad en nudos, fecha).',
        '• <code>$GPGGA / $GNGGA:</code> Datos de fijación GPS (calidad del fix, número de satélites visibles, altitud sobre el nivel del mar).',
        'Para obtener una posición válida (<em>fix</em>), el receptor debe ver al menos <strong>4 satélites</strong> con línea de vista despejada. Bajo techo o en estacionamientos cerrados la señal se atenúa enormemente.'
      ],
      teacher: 'Si el GPS no fija satélites, sácalos al patio antes de cambiar código: el 99% de las quejas de GPS son falta de cielo abierto.'
    },

    {
      type: 'concept',
      heading: 'Almacenamiento en microSD: bus SPI, FAT32 y tolerancia a fallos',
      body: [
        'El módulo microSD se comunica mediante el bus <strong>SPI (Serial Peripheral Interface)</strong> a alta velocidad (MOSI, MISO, SCK y Chip Select CS).',
        'Los datos se graban en un archivo de texto con formato <strong>CSV (Comma-Separated Values)</strong> estructurado con encabezados claros y timestamps en milisegundos.',
        '<strong>Reglas críticas para no perder datos en carrera:</strong>',
        '1. La tarjeta debe estar formateada estrictamente en <strong>FAT32</strong> (no exFAT ni NTFS).',
        '2. Cada bloque de datos debe vaciarse al medio físico mediante <code>archivo.flush()</code> para que un corte repentino de energía en un salto o choque no corrompa el archivo.',
        '3. El archivo debe cerrarse ordenadamente con <code>archivo.close()</code> al finalizar la prueba.'
      ],
      diagram: {
        src: '../assets/img/diagrams/spi-microsd.svg',
        alt: 'Diagrama de conexión SPI entre microcontrolador y módulo microSD',
        caption: 'Conexión SPI: MOSI, MISO, SCK y CS dedicados al registro local de alta velocidad.',
        wide: true
      },
      teacher: 'Muestra qué pasa si apagan el circuito sin hacer flush(): los últimos 512 bytes en buffer RAM se pierden para siempre.'
    },

    {
      type: 'concept',
      heading: '¿Cómo salen los datos del chasis? Vista previa a la radio (LoRa)',
      body: [
        'En este curso Básico nos concentramos en la adquisición fiable y el registro maestro en microSD a bordo (10 Hz).',
        'Sin embargo, en carrera real los ingenieros en pits necesitan ver la telemetría en vivo. Para eso, en el <strong>Curso Avanzado</strong> estudiarás a fondo la modulación <strong>LoRa (Long Range a 915 MHz)</strong>, el diseño de tramas binarias compactas, el presupuesto de enlace y la transmisión a la estación de boxes.',
        'Ten en cuenta el principio rector de MadRams: <em>la radio jamás sustituye a la microSD</em>. Si el coche pasa por una cañada y la señal de radio se corta temporalmente, el 100% de los datos permanece a salvo en la tarjeta de memoria.'
      ],
      diagram: {
        src: '../assets/img/diagrams/telemetry-pipeline.svg',
        alt: 'Pipeline de telemetría: adquisición en el coche y respaldo',
        caption: 'Arquitectura de telemetría MadRams: captura local a alta tasa en microSD + enlace en vivo a pits.',
        wide: true
      }
    },

    {
      type: 'concept',
      heading: 'El Data Day y el análisis de los 3 hallazgos',
      body: [
        'La telemetría solo cobra valor cuando se traduce en decisiones de ingeniería. Tras capturar tu archivo CSV en la prueba práctica, debes graficar los datos en Excel, Python o Grafana e identificar <strong>al menos 3 hallazgos defendibles</strong>:',
        '1. <em>"En este segundo el piloto frenó a fondo (fuerza G longitudinal negativa + caída abrupta de RPM)."</em>',
        '2. <em>"Aquí el coche pasó por un bache o salto fuerte (pico de aceleración en eje Z + compresión brusca de suspensión)."</em>',
        '3. <em>"Aquí la temperatura de la CVT superó los 90 °C tras una subida prolongada en pendiente."</em>'
      ]
    },

    {
      type: 'lab',
      heading: 'Pruébalo: visualiza la trama NMEA y el guardado en microSD'
    }
  ],

  decisionTable: {
    caption: 'Comparativa de métodos de almacenamiento y registro en el vehículo',
    headers: ['Método', 'Tasa de muestreo', 'Ventaja en carrera', 'Punto de fallo / Riesgo', 'Uso en MadRams'],
    rows: [
      ['Tarjeta microSD local (SPI)', '10 Hz a 100 Hz', '100% de datos preservados, altísima densidad', 'Vibración mecánica puede aflojar conectores de mala calidad', 'Registro maestro oficial de la carrera'],
      ['Radio LoRa 915 MHz', '1 Hz a 5 Hz', 'Largo alcance (hasta 2-5 km con línea de vista), bajo consumo', 'Ancho de banda estrecho; se pierden paquetes en zonas ciegas', 'Monitoreo en vivo en pantalla de pits (Curso Avanzado)'],
      ['Módem celular 4G / LTE', '2 Hz a 10 Hz', 'Sin límite de distancia, conexión directa a la nube', 'Depende de cobertura celular (inexistente en muchas pistas)', 'Estudiado en curso Avanzado como enlace secundario'],
      ['Memoria Flash interna (SPIFFS/EEPROM)', 'Eventos críticos', 'Sin partes móviles ni sockets', 'Capacidad limitada (pocos Megabytes), ciclos de escritura finitos', 'Guardado de configuración y odómetro total']
    ]
  },

  reference: {
    intro: 'El formato CSV debe estructurarse con encabezados estandarizados y unidades físicas explícitas en la primera fila. La sentencia NMEA RMC entrega velocidad en nudos (1 knot = 1.852 km/h).',
    formulas: [
      {
        label: 'Conversión de velocidad NMEA (nudos) a kilómetros por hora (km/h)',
        code: 'float velocidad_kmh = velocidad_nudos * 1.852;\n// Ejemplo: GPS reporta 18.5 nudos → 18.5 * 1.852 = 34.26 km/h'
      },
      {
        label: 'Estructura recomendada del encabezado del archivo CSV en microSD',
        code: 'timestamp_ms,latitud,longitud,velocidad_kmh,temperatura_motor_c,temperatura_cvt_c,suspension_deg,accel_z_g\n12450,19.432608,-99.133209,34.2,92.5,84.1,14.2,1.05'
      }
    ],
    tables: [
      {
        caption: 'Estructura de la sentencia NMEA $GPRMC / $GNRMC',
        headers: ['Campo', 'Ejemplo', 'Significado técnico'],
        rows: [
          ['Encabezado', '$GNRMC', 'Sentencia RMC (Recommended Minimum Navigation Information)'],
          ['Hora UTC', '194530.00', '19 horas, 45 minutos, 30.00 segundos UTC'],
          ['Estado del fix', 'A', 'A = Válido (Active), V = Advertencia/Inválido (Void)'],
          ['Latitud', '2035.4210,N', '20 grados 35.4210 minutos Norte'],
          ['Longitud', '10324.1150,W', '103 grados 24.1150 minutos Oeste'],
          ['Velocidad', '18.5', 'Velocidad sobre el suelo en nudos (Knots)'],
          ['Checksum', '*4E', 'Verificación XOR de integridad de la trama']
        ]
      }
    ]
  },

  errors: [
    'Tarjeta microSD en formato exFAT o NTFS: <code>SD.begin()</code> devolverá falso inmediatamente. Debe formatearse en FAT32 con tamaño de asignación de 32 KB.',
    'No invocar <code>flush()</code> tras escribir: los datos permanecen en la memoria RAM volátil del microcontrolador y se pierden si se desconecta la alimentación antes de <code>close()</code>.',
    'Intentar obtener fix GPS dentro de un edificio con techo metálico: el receptor no recibirá los 4 satélites requeridos y los campos de coordenadas saldrán vacíos o en 0.0.',
    'Abrir y cerrar el archivo en cada pasada del loop: destruye la velocidad de muestreo. Es mejor abrirlo una vez en <code>setup()</code> y usar <code>flush()</code> periódicamente.'
  ],

  deliverable: {
    title: 'Entregable Final de Curso: Dataset en MicroSD y Reporte de Telemetría (Data Day)',
    items: [
      'Código fuente del sketch de adquisición (GPS + lectura de sensores + guardado en microSD).',
      'Esquema de conexión o fotografía clara del montaje del sistema en banco de pruebas o vehículo.',
      'Archivo CSV crudo extraído de la tarjeta microSD con encabezados claros, unidades y timestamps continuos.',
      'Documento o gráfica de la corrida con la justificación técnica de <strong>3 hallazgos defendibles</strong> (ej. frenada brusca, impacto/bache, incremento térmico en CVT).'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'Dato capturado y registrado correctamente en tarjeta microSD ', weight: '30%' },
    { criterion: 'Archivo CSV con estructura válida, unidades físicas explícitas y timestamps continuos ', weight: '25%' },
    { criterion: 'Identificación y defensa técnica de 3 hallazgos fundamentados en la telemetría ', weight: '25%' },
    { criterion: 'Código limpio, modular y documentado para la adquisición de datos ', weight: '20%' }
  ],

  bibliography: [
    'u-blox AG (2023) — MAX-M10S Ultra-low Power GNSS Receiver Datasheet and Protocol Description (UBX-20035253).',
    'SD Card Association (2020) — SD Specifications Part 1: Physical Layer Simplified Specification (Version 8.00).',
    'National Marine Electronics Association (2018) — NMEA 0183 Standard for Interfacing Marine Electronic Devices (Version 4.10).',
    'Semtech Corporation (2022) — SX1261/2 Long Range Low Power Transceiver Overview.'
  ],

  prev: { label: '05 · Bus I²C (MPU6050 + AS5600)', url: 'sesion-5.html' },
  next: { label: 'Continuar al Curso Intermedio: Arquitectura y RTOS', url: 'https://luisxavierxd.github.io/MadRamsCursoTelemetriaIntermedio/' }
};
