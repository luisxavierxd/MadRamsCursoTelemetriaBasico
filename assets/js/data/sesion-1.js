window.SESSION_DATA = {
  slug: 'sesion-1',
  number: '01',
  icon: '⚡',
  title: 'Electricidad + Arduino',
  quote: 'Base indispensable: sin entender voltaje, corriente y resistencia, ningún sensor tiene sentido.',
  badges: [
    '1:30h (25 min teoría / 65 min práctica)',
    'Fundamentos de instrumentación — base de todo el sistema',
    'LED, resistencias, multímetro y primer sketch'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788351',
    titulo: 'MadRams S1 · Ley de Ohm, LED y Multímetro'
  },

  simulator: {
    type: 'ohm-law',
    title: 'Laboratorio: Ley de Ohm y el LED',
    caption: 'Ajusta resistencia y voltaje; mira cómo cambia la corriente y si el LED sobrevive.'
  },

  model: {
    label: 'Arduino Uno',
    alt: 'Modelo 3D de Arduino Uno',
    src: '../assets/models/ArduinoUno.glb',
    orientation: '0deg 0deg 203deg',
    specs: [
      { k: 'Microcontrolador', v: 'ATmega328P' },
      { k: 'Voltaje lógico', v: '<span class="hl">5 V</span>' },
      { k: 'E/S digitales', v: '14 (6 PWM ~)' },
      { k: 'Entradas analógicas', v: '6 (A0–A5, 10 bits)' },
      { k: 'Flash / SRAM', v: '32 KB / 2 KB' },
      { k: 'Reloj', v: '16 MHz' },
      { k: 'Bus I2C', v: 'A4 SDA · A5 SCL' },
      { k: 'En el coche real', v: 'Heltec WiFi LoRa 32 V4 (ESP32-S3)' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'Por qué importa para Baja SAE',
      body: 'Todo sensor de telemetría se reduce, al final, a leer un <strong>voltaje</strong> o una variación de corriente. Esta sesión es el cimiento de todo el curso: sin la Ley de Ohm y sin dominar el multímetro para diagnosticar continuidades y caídas de tensión, ningún sensor posterior funcionará con confiabilidad en la pista.'
    },

    {
      type: 'callout',
      heading: 'Dinámica de trabajo: Notion para retos, Microsoft Teams para entregas',
      body: 'Para mantener el curso siempre actualizado con los componentes reales del coche, las <strong>instrucciones detalladas de cada práctica y los enlaces actualizados a los proyectos de Wokwi viven en el Notion del equipo</strong> (accede con el botón al final de la página). Las <strong>entregas se suben a la tarea correspondiente en Microsoft Teams</strong>, donde el instructor te agregará con tu cuenta institucional (<code>@tec.mx</code>) al iniciar el curso. Ahí recibirás tu calificación y retroalimentación privada.'
    },

    {
      type: 'concept',
      heading: 'Voltaje, corriente y resistencia',
      body: [
        'Imagina agua fluyendo por una tubería. El <strong>voltaje</strong> (V, en volts) es la presión de la bomba que empuja el agua; la <strong>corriente</strong> (I, en amperes) es el caudal de agua que pasa por segundo; y la <strong>resistencia</strong> (R, en ohms Ω) es qué tan estrecho es el tubo, oponiéndose al paso.',
        'En electrónica ocurre exactamente lo mismo con los electrones: el voltaje empuja, la corriente fluye y la resistencia limita. Todo lo que harás en el curso —desde encender un LED indicador hasta leer un sensor de suspensión— consiste en controlar estas tres cantidades.'
      ],
      teacher: 'Ancla la analogía del agua antes de la fórmula: presión = voltaje, flujo = corriente, tubo angosto = resistencia. Pregunta "¿qué pasa si aumento la presión sin cambiar el tubo?" para que deduzcan que más voltaje genera más corriente.'
    },

    {
      type: 'concept',
      heading: 'La Ley de Ohm: V = I × R',
      body: [
        'Estas tres cantidades están unidas por la ecuación fundamental de la electrónica: <code>V = I × R</code>. Si conoces dos de ellas, siempre puedes calcular la tercera.',
        'El truco visual es el <strong>triángulo</strong>: tapa con el dedo la cantidad que buscas y las otras dos te dan la fórmula. ¿Buscas R? Tápala y queda <code>V / I</code>.',
        'Ejemplo de la práctica de hoy: el microcontrolador entrega 5V, pero un LED estándar solo tolera ~2V y ~15mA (0.015A) sin destruirse. ¿Qué resistencia en serie debemos colocar? <code>R = (5V − 2V) / 0.015A = 200Ω</code>, y usamos el valor comercial estándar más cercano: <span class="value-hl">220Ω</span>. Sin esta resistencia limitadora, la corriente se dispara y el LED se quema de inmediato.'
      ],
      diagram: {
        src: '../assets/img/diagrams/ohm-triangle.svg',
        alt: 'Triángulo de la Ley de Ohm',
        caption: 'Tapa la cantidad que buscas: las otras dos forman la fórmula.'
      },
      teacher: 'Pídeles interactuar con el laboratorio de abajo y bajar la resistencia hasta superar los 20 mA para ver el fallo térmico del LED.'
    },

    {
      type: 'lab',
      heading: 'Pruébalo: sube la corriente hasta quemar el LED'
    },

    {
      type: 'concept',
      heading: 'Circuitos en serie vs. en paralelo',
      body: [
        'Los componentes electrónicos se conectan de dos formas principales:',
        '• <strong>En serie:</strong> Uno tras otro en un único camino. La misma corriente pasa por todos los componentes y los voltajes individuales se suman para dar el total de la fuente.',
        '• <strong>En paralelo:</strong> En ramas independientes conectadas a los mismos nodos. Todos los componentes ven el mismo voltaje de alimentación y la corriente total se reparte entre las ramas.',
        'La resistencia limitadora del LED se coloca <strong>en serie</strong> con el LED para garantizar que toda la corriente que llega al semiconductor pase primero por ella y quede limitada de forma segura.'
      ],
      diagram: {
        src: '../assets/img/diagrams/series-parallel.svg',
        alt: 'Circuitos en serie y en paralelo',
        caption: 'Serie: misma corriente, voltajes que se suman. Paralelo: mismo voltaje, corriente que se reparte.',
        wide: true
      },
      teacher: 'Error clásico de principiante: conectar la resistencia en paralelo con el LED. Si se quema el LED teniendo resistencia en la protoboard, verifica si está en paralelo en vez de serie.'
    },

    {
      type: 'concept',
      heading: 'Sintaxis básica de Arduino desde cero: setup(), loop() y estructura',
      body: [
        'Programamos en <strong>C++ para sistemas embebidos</strong>. Aunque nunca hayas programado antes, la estructura básica se resume en unas cuantas reglas indispensables:',
        '• <strong>Punto y coma obligatorio (<code>;</code>):</strong> Toda instrucción o mandato debe terminar con <code>;</code>. Le indica al compilador que la orden ha concluido. Si olvidas uno, el código no compilará.',
        '• <strong>Bloques de código con llaves (<code>{ }</code>):</strong> Las llaves agrupan conjuntos de instrucciones que pertenecen a una función o a una condición.',
        '• <strong>Sensible a mayúsculas (Case Sensitive):</strong> En C++, <code>digitalWrite</code> NO es lo mismo que <code>digitalwrite</code>. Los comandos deben escribirse exactamente con sus mayúsculas correspondientes.',
        '• <strong>Comentarios (<code>//</code>):</strong> Todo texto precedido por <code>//</code> es una nota para humanos y el microcontrolador la ignora por completo.',
        '• <strong><code>void setup()</code>:</strong> Es la función de configuración. Se ejecuta <strong>una sola vez</strong> cuando el microcontrolador se enciende o se reinicia. Aquí defines qué pines son entradas o salidas.',
        '• <strong><code>void loop()</code>:</strong> Es la función principal de ejecución. Se repite en un <strong>bucle infinito</strong> continuo a máxima velocidad (miles de veces por segundo).'
      ],
      code: '// 1. Declarar constante con el número de pin digital\nconst int PIN_LED = 13;\n\nvoid setup() {\n  // pinMode le dice al microcontrolador: "este pin entregará voltaje"\n  pinMode(PIN_LED, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(PIN_LED, HIGH); // digitalWrite en HIGH = entrega 5V (enciende)\n  delay(500);                  // delay(ms) = pausa durante 500 milisegundos\n\n  digitalWrite(PIN_LED, LOW);  // digitalWrite en LOW = pone a 0V/GND (apaga)\n  delay(500);                  // pausa 500 ms antes de reiniciar el loop\n}',
      teacher: 'Haz que memoricen las 3 funciones básicas de hardware: pinMode() para configurar el rol del pin, digitalWrite() para poner 5V/0V, y delay() para pausar en milisegundos.'
    },

    {
      type: 'concept',
      heading: 'El multímetro: diagnóstico y resolución de fallos',
      body: [
        'El <strong>multímetro digital</strong> es tu herramienta de diagnóstico más importante. Mide tres magnitudes indispensables:',
        '1. <strong>Voltaje DC:</strong> Verifica si la fuente o el regulador entregan la tensión esperada (ej. 5V, 3.3V, 12V).',
        '2. <strong>Continuidad (beep):</strong> Comprueba si existe camino eléctrico cerrado entre dos puntos (encuentra cables rotos o pistas abiertas).',
        '3. <strong>Resistencia (Ω):</strong> Confirma el valor real de un resistor o sensor resistivo antes de energizar.',
        'Regla de oro de MadRams: <strong>cuando un circuito no responda, mide con el multímetro antes de asumir un error en el código</strong>.'
      ]
    }
  ],

  decisionTable: {
    caption: 'Técnicas de medición y diagnóstico con multímetro en el vehículo',
    headers: ['Modo del multímetro', 'Cómo se conecta', '¿Circuito energizado?', 'Cuándo se usa en telemetría', 'Riesgo / Error común'],
    rows: [
      ['Voltaje DC (V=)', 'En paralelo con el componente', 'SÍ (encendido)', 'Verificar alimentación de sensores (3.3V / 5V)', 'Poner cables en bornes de corriente por error'],
      ['Continuidad (Audio)', 'Entre los dos extremos de la línea', 'NO (apagado)', 'Rastrear cables largos del arnés y buscar falsos contactos', 'Medir con energía: puede quemar el fusible del tester'],
      ['Resistencia (Ω)', 'En paralelo con el elemento aislado', 'NO (apagado)', 'Comprobar valores de pull-up y potenciómetros', 'Medir con el resistor conectado a otros componentes en paralelo'],
      ['Corriente DC (mA / A)', 'En SERIE intercalado en el cable', 'SÍ (encendido)', 'Medir consumo total del nodo de telemetría', 'Conectar en paralelo con la batería: genera cortocircuito directo']
    ]
  },

  reference: {
    intro: 'Resumen de las tres fórmulas fundamentales derivadas de la Ley de Ohm y la función de temporización en milisegundos.',
    formulas: [
      {
        label: 'Ley de Ohm — Voltaje, Corriente y Resistencia',
        code: 'V = I * R      (Voltios = Amperios * Ohmios)\nI = V / R      (Amperios = Voltios / Ohmios)\nR = V / I      (Ohmios = Voltios / Amperios)'
      },
      {
        label: 'Cálculo de la resistencia limitadora para un LED',
        code: 'R = (V_fuente - V_led) / I_led\n// Ejemplo: R = (5.0V - 2.0V) / 0.015A = 200 Ω -> Comercial estándar: 220 Ω'
      },
      {
        label: 'Comandos esenciales de Arduino (Guía Rápida)',
        code: 'pinMode(pin, OUTPUT);          // Configura pin como salida\npinMode(pin, INPUT);           // Configura pin como entrada\ndigitalWrite(pin, HIGH);       // Envía 5V (o 3.3V)\ndigitalWrite(pin, LOW);        // Envía 0V (GND)\ndelay(milisegundos);           // Pausa (1000 ms = 1 segundo)'
      }
    ],
    tables: [
      {
        caption: 'Códigos de colores comunes de resistencias de 4 bandas',
        headers: ['Color 1ª y 2ª banda', 'Multiplicador (3ª banda)', 'Tolerancia (4ª banda)', 'Ejemplo común'],
        rows: [
          ['Negro (0) / Marrón (1)', '×1 Ω / ×10 Ω', 'Marrón (±1%)', '10 Ω (Marrón-Negro-Negro)'],
          ['Rojo (2) / Naranja (3)', '×100 Ω / ×1 kΩ', 'Rojo (±2%)', '220 Ω (Rojo-Rojo-Marrón)'],
          ['Amarillo (4) / Verde (5)', '×10 kΩ / ×100 kΩ', 'Oro (±5%)', '4.7 kΩ (Amarillo-Violeta-Rojo)'],
          ['Azul (6) / Violeta (7)', '×1 MΩ / ×10 MΩ', 'Plata (±10%)', '10 kΩ (Marrón-Negro-Naranja)']
        ]
      }
    ]
  },

  errors: [
    'Olvidar la resistencia limitadora del LED: conectarlo directo a 5V provoca una corriente destructiva instantánea (>50mA) que quema el diodo o daña el pin del microcontrolador.',
    'Conectar la resistencia limitadora en paralelo en vez de en serie: la resistencia debe compartir la misma rama de corriente con el ánodo o cátodo del LED.',
    'Olvidar el punto y coma (<code>;</code>) al final de una instrucción: es el error de compilación más frecuente en principiantes.',
    'Escribir funciones con mayúsculas incorrectas (ej. <code>digitalwrite</code> en vez de <code>digitalWrite</code>): C++ es sensible a mayúsculas y no reconocerá la función.',
    'Conectar el multímetro en modo amperímetro (mA/A) en paralelo con una fuente de poder: el amperímetro tiene resistencia casi nula y genera un cortocircuito directo con chispas o fusible quemado.'
  ],

  deliverable: {
    title: 'Práctica: Ley de Ohm y Blink Estructurado',
    items: [
      'Enlace al proyecto Wokwi con Arduino/ESP32 y circuito de LED con resistencia limitadora según las instrucciones de Notion.',
      'Captura de pantalla de la simulación activa mostrando la caída de tensión en el LED y en el resistor con el multímetro virtual.',
      'Código fuente en C++ bien estructurado con funciones setup/loop y constantes con nombre.',
      'Cálculo de la Ley de Ohm justificando el valor de la resistencia seleccionada.'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'Cálculo y selección correcta de la resistencia limitadora según Ley de Ohm ', weight: '30%' },
    { criterion: 'Circuito funcional en Wokwi sin sobrecorriente ni daño al LED ', weight: '25%' },
    { criterion: 'Código C++ estructurado con nombres de constantes, setup() y loop() limpios ', weight: '25%' },
    { criterion: 'Medición virtual con multímetro demostrando caídas de tensión ', weight: '20%' }
  ],

  bibliography: [
    'Scherz, P.; Monk, S. (2016) — Practical Electronics for Inventors (4th ed.). McGraw-Hill: Ch. 2 (Theory) & Ch. 3 (Basic Components).',
    'Boylestad, R. L. (2015) — Introductory Circuit Analysis (13th ed.). Pearson: Ohm’s Law, Series and Parallel Circuits.',
    'Arduino Documentation (2024) — Foundations: Anatomy of a Sketch (setup, loop, pinMode, digitalWrite, delay).',
    'Fluke Corporation (2023) — Digital Multimeter Basics: Safe Measurements of Voltage, Current, and Resistance.'
  ],

  cta: {
    label: 'Ver instrucciones completas y retos en Notion →',
    url: 'https://balsam-ringer-081.notion.site/Pr-ctica-3a5b2fdbb6b981ea8e70ebdee9da3063'
  },

  prev: null,
  next: { label: '02 · Fundamentos PRIMM (termostato)', url: 'sesion-2.html' }
};
