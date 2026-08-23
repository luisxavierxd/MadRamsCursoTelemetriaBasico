window.SESSION_DATA = {
  slug: 'sesion-4',
  number: '04',
  icon: '🌡️',
  title: 'Temperatura (DS18B20 + 1-Wire)',
  quote: 'Bus 1-Wire y calibración de múltiples sensores térmicos compartiendo un solo conductor de datos.',
  badges: [
    '1:30h (25 min teoría / 65 min práctica)',
    'DS18B20 en motor y CVT · dos sensores en un solo cable',
    'Resistencia pull-up de 4.7 kΩ y direccionamiento ROM 64-bit'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788355',
    titulo: 'MadRams S4 · DS18B20 y Bus 1-Wire'
  },

  simulator: {
    type: 'onewire-temp',
    title: 'Laboratorio interactivo: bus OneWire y umbrales térmicos',
    caption: 'Dos sensores DS18B20 en un solo cable. Ajusta la temperatura de motor/CVT y desconecta la resistencia pull-up para ver el fallo real (-85°C).'
  },

  model: {
    label: 'DS18B20 en cápsula impermeable',
    alt: 'Modelo 3D del sensor de temperatura digital DS18B20',
    src: '../../assets/models/DS18B20.glb',
    orientation: '0deg 0deg 180deg',
    specs: [
      { k: 'Interfaz digital', v: 'Dallas 1-Wire (1 solo hilo de datos bidireccional)' },
      { k: 'Voltaje de operación', v: '3.0 V a 5.5 V' },
      { k: 'Rango de medición', v: '<span class="hl">−55.0 °C a +125.0 °C</span>' },
      { k: 'Precisión calibrada', v: '±0.5 °C (entre −10 °C y +85 °C)' },
      { k: 'Resolución configurable', v: '9 a 12 bits (0.0625 °C por LSB)' },
      { k: 'Identificador único', v: 'ROM address de 64 bits grabada en silicio de fábrica' },
      { k: 'Resistencia pull-up', v: '<span class="hl">4.7 kΩ</span> obligatoria entre DATA y VCC' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'Conexión con MadRams: proteger el motor y la transmisión',
      body: 'En las pruebas de resistencia de 4 horas de Baja SAE, la temperatura es el factor número uno de abandono mecánico. MadRams instala sensores DS18B20 en dos zonas críticas: el <strong>cárter del motor</strong> (alerta si supera los <span class="value-hl">&gt;110 °C</span>) y la <strong>caja de la transmisión CVT</strong> (advertencia <span class="value-hl">&gt;90 °C</span>, fallo inminente <span class="value-hl">&gt;105 °C</span>). Ambos sensores comparten exactamente el mismo cableado de datos gracias al protocolo 1-Wire.'
    },

    {
      type: 'concept',
      heading: 'El protocolo 1-Wire: múltiples dispositivos en un solo cable',
      body: [
        'A diferencia de buses como SPI (que requiere 4 cables) o I²C (que usa 2), el protocolo <strong>Dallas 1-Wire</strong> utiliza un <strong>único cable de datos</strong> compartido (más VCC y GND) para comunicar el microcontrolador con decenas de sensores.',
        '¿Cómo sabe el microcontrolador a cuál sensor le está hablando? Cada chip DS18B20 contiene en su interior un código <strong>ROM único e irrepetible de 64 bits</strong> grabado con láser en fábrica.',
        'El programa puede solicitar: <em>"sensor con dirección ROM 28-FF-64-1A, entrega tu temperatura"</em>, permitiendo distinguir con 100% de certeza cuál lectura corresponde al motor y cuál a la CVT.'
      ],
      diagram: {
        src: '../../assets/img/diagrams/onewire-bus.svg',
        alt: 'Bus OneWire con múltiples sensores DS18B20 y resistencia pull-up',
        caption: 'Topología de bus 1-Wire: un solo pin de datos con pull-up conecta múltiples sensores identificados por su ROM de 64 bits.',
        wide: true
      },
      teacher: 'Analogía del salón de clases: un solo pasillo (cable de datos) donde el profesor pasa lista llamando a cada alumno por su matrícula de 64 bits.'
    },

    {
      type: 'concept',
      heading: 'La resistencia pull-up de 4.7 kΩ: por qué no es opcional',
      body: [
        'La línea de datos de 1-Wire es de tipo <strong>colector abierto (open-drain)</strong>: el microcontrolador y los sensores solo pueden tirar la línea hacia tierra (LOW), pero nadie la empuja activamente a 5V/3.3V (HIGH).',
        'La <strong>resistencia pull-up de 4.7 kΩ</strong> conectada entre el pin de DATA y VCC es la encargada de regresar la línea al nivel lógico ALTO cuando ningún sensor está transmitiendo.',
        'Si falta esta resistencia, el pin queda eléctricamente "flotando". El sensor no logra completar la secuencia de inicialización (Presence Pulse) y la librería devuelve los códigos de error clásicos: <span class="value-hl">−127.0 °C</span> (sensor desconectado) o <span class="value-hl">+85.0 °C</span> (reinicio de registro sin conversión completada).'
      ],
      teacher: 'Pídeles experimentar en el simulador desactivando el pull-up: ver el -85°C en vivo es la mejor manera de diagnosticar fallos de arnés en pits.'
    },

    {
      type: 'concept',
      heading: 'Tiempos de conversión y muestreo térmico',
      body: [
        'A resolución máxima (12 bits), el DS18B20 requiere hasta <strong>750 ms</strong> para realizar la conversión analógica interna de temperatura y almacenarla en su scratchpad.',
        'Si el código llama a <code>sensors.requestTemperatures()</code> de forma bloqueante en cada vuelta del loop, el programa se congelará 3/4 de segundo, impidiendo leer la suspensión o atender la telemetría.',
        'En sistemas profesionales de telemetría configuramos el sensor en <strong>modo no bloqueante</strong> (asíncrono): se lanza la orden de conversión y se lee el valor en la siguiente pasada cuando haya transcurrido el tiempo requerido.'
      ]
    },

    {
      type: 'lab',
      heading: 'Pruébalo: monitoreo dual y diagnóstico de pull-up'
    }
  ],

  decisionTable: {
    caption: 'Comparativa de sensores de temperatura para vehículos de competencia',
    headers: ['Sensor', 'Protocolo / Salida', 'Rango útil', 'Ventajas principales', 'Desventajas / Cuándo no usar'],
    rows: [
      ['DS18B20 (Digital)', '1-Wire (ROM 64b)', '-55 °C a +125 °C', 'Inmune a ruido electromagnético, múltiples sensores en 1 pin', 'No mide temperaturas extremas de escape (>125°C)'],
      ['Termopar Tipo K con MAX6675/MAX31855', 'Digital SPI', '-200 °C a +1350 °C', 'Ideal para temperatura de gases de escape (EGT) y frenos', 'Requiere integrado amplificador con compensación de unión fría'],
      ['Termistor NTC (Resistivo)', 'Analógico (divisor de tensión)', '-40 °C a +150 °C', 'Bajísimo costo, respuesta térmica casi instantánea', 'Curva no lineal (Steinhart-Hart), vulnerable a ruido en cables largos'],
      ['Sensor infrarrojo sin contacto (MLX90614)', 'Digital I²C (0x5A)', '-70 °C a +380 °C', 'Mide temperatura de llantas o banda de CVT sin rozamiento', 'La lente se ensucia con polvo o lodo alterando la emisividad']
    ]
  },

  reference: {
    intro: 'El bus 1-Wire requiere iniciar con un pulso de reset del maestro seguido por un pulso de presencia del esclavo. Cada lectura se realiza mediante ranuras de tiempo (time slots) de 60 microsegundos.',
    formulas: [
      {
        label: 'Cálculo de corriente en la línea 1-Wire con pull-up',
        code: 'I_pullup = VCC / R_pullup\n// Con VCC = 3.3V y R = 4.7 kΩ:\nI_pullup = 3.3 / 4700 ≈ 0.70 mA (cumple con el límite máximo de 4 mA por pin del DS18B20)'
      },
      {
        label: 'Lectura básica con librería DallasTemperature en Arduino/ESP32',
        code: '#include <OneWire.h>\n#include <DallasTemperature.h>\nOneWire oneWire(PIN_DATOS);\nDallasTemperature sensors(&oneWire);\n\nvoid setup() {\n  sensors.begin();\n  sensors.setWaitForConversion(false); // Modo no bloqueante\n}'
      }
    ],
    tables: [
      {
        caption: 'Códigos de diagnóstico de error típicos del DS18B20',
        headers: ['Lectura devuelta', 'Significado técnico', 'Causa raíz en el coche', 'Acción de solución en pits'],
        rows: [
          ['-127.0 °C (DEVICE_DISCONNECTED_C)', 'Línea de datos abierta o sensor no encontrado', 'Cable roto en arnés, GND suelto o sensor quemado', 'Verificar continuidad con multímetro y conectores JST'],
          ['+85.0 °C (RESET_VALUE)', 'Registro sin conversión térmica completada', 'Se leyó el sensor antes de esperar los 750ms de conversión', 'Usar timers o verificar alimentación durante la conversión'],
          ['-85.0 °C a -55.0 °C intermitente', 'Ruido inducido o voltaje insuficiente', 'Falta resistencia pull-up o cable pasa pegado al cable de bujía', 'Instalar pull-up de 4.7kΩ y trenzar cable de datos con GND']
        ]
      }
    ]
  },

  errors: [
    'Olvidar la resistencia pull-up de 4.7 kΩ: la línea de datos queda flotando y el sensor arroja lecturas de -127°C o 85°C.',
    'Alimentar con cables excesivamente largos sin trenzar: el ruido electromagnético de la chispa de la bujía del motor corrompe las tramas digitales de 1-Wire.',
    'Llamar a <code>requestTemperatures()</code> de forma síncrona en cada ciclo: congela la ejecución del microcontrolador 750 ms por llamada.',
    'Invertir VCC y GND en el sensor: el DS18B20 entra en cortocircuito térmico interno, se calienta al tacto y puede dañarse en segundos.'
  ],

  deliverable: {
    title: 'Práctica Wokwi: Monitoreo Térmico Dual con DS18B20',
    items: [
      'Link público al proyecto Wokwi con dos sensores DS18B20 conectados en paralelo sobre el mismo pin con resistencia pull-up de 4.7kΩ.',
      'Captura de pantalla del monitor serial mostrando la lectura independiente de Motor y CVT con sus respectivas direcciones ROM de 64 bits.',
      'Código fuente implementando la lógica de alarma (>110°C en motor y >90°C en CVT) con indicadores LED.',
      'README documentando las direcciones ROM encontradas y la justificación de los umbrales térmicos elegidos.'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'Conexión e identificación independiente de múltiples sensores en bus 1-Wire por ROM ', weight: '30%' },
    { criterion: 'Dimensionamiento correcto del pull-up y explicación de los códigos de error -127°C/85°C ', weight: '25%' },
    { criterion: 'Implementación correcta de la lógica de alertas para motor y CVT ', weight: '25%' },
    { criterion: 'Estructura del código C++, constantes nombradas y ausencia de delays bloqueantes ', weight: '20%' }
  ],

  bibliography: [
    'Maxim Integrated / Analog Devices (2019) — DS18B20 Programmable Resolution 1-Wire Digital Thermometer Datasheet (Rev 6).',
    'Analog Devices (2021) — Application Note 148: Guidelines for Reliable Long-Line 1-Wire Networks.',
    'Burton, M. (2023) — DallasTemperature Arduino Library Architecture and Non-Blocking Conversion API Documentation.',
    'Scherz, P., & Monk, S. (2016) — Practical Electronics for Inventors (4th ed.). McGraw-Hill: Digital Temperature Transducers.'
  ],

  cta: {
    label: 'Ver instrucciones completas y retos en Notion →',
    url: 'https://balsam-ringer-081.notion.site/Pr-ctica-3a5b2fdbb6b981d393cdf664a8a6edc6'
  },

  prev: { label: '03 · Suspensión (potenciómetro)', url: '../sesion-3/' },
  next: { label: '05 · Bus I²C (MPU6050 + AS5600)', url: '../sesion-5/' }
};
