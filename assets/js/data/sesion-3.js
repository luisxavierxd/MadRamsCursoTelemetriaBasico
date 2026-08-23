window.SESSION_DATA = {
  slug: 'sesion-3',
  number: '03',
  icon: '🔧',
  title: 'Suspensión (potenciómetro)',
  quote: 'Divisor de voltaje y conversión analógica aplicados al sensor real de recorrido de suspensión.',
  badges: [
    '1:30h (25 min teoría / 65 min práctica)',
    'Potenciómetro OEM GM 15098628/29 en suspensión',
    'Divisor 5V→3.3V y alerta de sobre-recorrido > 25°'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788354',
    titulo: 'MadRams S3 · Potenciómetro de Suspensión y Divisor'
  },

  simulator: {
    type: 'voltage-divider',
    title: 'Laboratorio interactivo: del ángulo al ADC y la alerta',
    caption: 'Mueve el ángulo de la suspensión y sigue la señal: sensor resistivo → divisor 5V/3.3V → lectura ADC → map() → alerta de sobre-recorrido.'
  },

  model: {
    label: 'Potenciómetro OEM GM',
    alt: 'Modelo 3D del potenciómetro rotativo de suspensión',
    src: '../../assets/models/Pot10k.glb',
    orientation: '90deg 0deg 180deg',
    specs: [
      { k: 'Tipo', v: 'Rotativo resistivo de alta durabilidad' },
      { k: 'Resistencia', v: '10 kΩ nominal' },
      { k: 'Terminales', v: '3 (VCC, GND, cursor central)' },
      { k: 'Salida', v: 'Voltaje analógico lineal (0 a Vcc)' },
      { k: 'En MadRams', v: 'Sensor de recorrido de suspensión (×4 ruedas)' },
      { k: 'Número de parte real', v: 'OEM GM 15098628 / 15098629' },
      { k: 'Acondicionamiento', v: 'Divisor resistivo 5V → 3.3V hacia ESP32' },
      { k: 'Umbral de advertencia', v: '<span class="hl">&gt; 25.0°</span> de deflexión' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'Conexión con el coche MadRams',
      body: 'El sensor de suspensión del coche es literalmente un <strong>potenciómetro rotativo OEM de uso automotriz</strong> (GM 15098628/29), instalado con bieletas en cada una de las 4 esquinas de la suspensión. El sensor opera alimentado a 5V para mantener buena inmunidad a ruido, pero las entradas del ESP32 <strong>solo toleran 3.3V</strong>. Para proteger el chip y no quemar el puerto, la señal pasa por un <strong>divisor de voltaje</strong> calibrado: exactamente el circuito que calculamos y simulamos hoy.'
    },

    {
      type: 'concept',
      heading: 'Señales analógicas vs. señales digitales',
      body: [
        'En la instrumentación del coche trabajamos con dos tipos de señal:',
        '• <strong>Digital:</strong> Solo tiene dos estados discretos: encendido o apagado, HIGH (1) o LOW (0), como un interruptor de encendido o el sensor de freno presionado.',
        '• <strong>Analógica:</strong> Puede tomar cualquier valor continuo dentro de un rango de voltaje, como una perilla o la posición de la suspensión conforme la llanta sube y baja al pasar por baches y rocas.',
        'El microcontrolador procesa internamente números digitales binarios, pero el potenciómetro produce un voltaje analógico continuo. Para comunicarlos, necesitamos un convertidor.'
      ],
      teacher: 'Muestra la diferencia física: un interruptor todo/nada (digital) vs la perilla de volumen (analógica). Pregunta qué tipo de dato describe mejor la posición física de un amortiguador.'
    },

    {
      type: 'concept',
      heading: 'analogRead(): de voltaje analógico a número digital (ADC)',
      body: [
        'El <strong>ADC</strong> (Analog-to-Digital Converter) es el periférico interno del microcontrolador que muestrea un voltaje continuo y lo transforma en un entero digital.',
        'En microcontroladores de 10 bits (como ATmega328P de Arduino Uno), el rango de 0–5V se divide en <code>2¹⁰ = 1024</code> niveles (<span class="value-hl">0 a 1023</span>).',
        'En microcontroladores de 12 bits (como el ESP32 del coche real), el rango de 0–3.3V se divide en <code>2¹² = 4096</code> niveles (<span class="value-hl">0 a 4095</span>).',
        'La ecuación de conversión es directa: <code>Lectura_ADC = (V_medido / V_referencia) × (2^N - 1)</code>. Si el potenciómetro entrega la mitad del voltaje, el ADC lee exactamente la mitad de su escala máxima.'
      ],
      diagram: {
        src: '../../assets/img/diagrams/adc-staircase.svg',
        alt: 'El ADC cuantifica un voltaje continuo en escalones discretos',
        caption: 'El voltaje continuo se aproxima mediante escalones discretos (cuantización).'
      },
      teacher: 'Que comprendan que la resolución en bits define la finura del escalón: 12 bits da 4 veces más resolución que 10 bits.'
    },

    {
      type: 'concept',
      heading: 'Divisor de voltaje: proteger entradas de 3.3V frente a 5V',
      body: [
        'El sensor automotriz se alimenta con 5V desde la fuente del coche, por lo que su salida máxima puede llegar a 5V. Sin embargo, los pines analógicos del ESP32 <strong>se destruyen irreversiblemente</strong> si reciben voltajes superiores a 3.6V.',
        'La solución estándar y más confiable es un <strong>divisor de voltaje pasivo</strong> formado por dos resistencias en serie (R1 y R2):',
        '<code>V_out = V_in × (R2 / (R1 + R2))</code>',
        'Si usamos <code>R1 = 10 kΩ</code> y <code>R2 = 15 kΩ</code> (o <code>R1 = 10 kΩ</code> y <code>R2 = 6.8 kΩ</code> para mayor margen), bajamos los 5.0V máximos a un valor seguro de <code>≈ 3.0V</code> o <code>≈ 2.02V</code>.',
        '⚠️ <strong>Regla sagrada de telemetría:</strong> nunca conectes un sensor de 5V directo a un pin de 3.3V sin divisor o adaptador de nivel.'
      ],
      diagram: {
        src: '../../assets/img/diagrams/voltage-divider.svg',
        alt: 'Esquema de divisor de voltaje con dos resistencias en serie',
        caption: 'Circuito divisor de voltaje que atenúa 5V a niveles seguros para el ESP32.'
      },
      teacher: 'Enfatiza que R2 es la resistencia conectada a tierra y es sobre la cual se toma la medición V_out.'
    },

    {
      type: 'concept',
      heading: 'map(): reescalar el valor crudo al ángulo real en grados',
      body: [
        'El número entero del ADC (ej. 1850) no le dice nada útil al piloto en cabina. La función <code>map(valor, in_min, in_max, out_min, out_max)</code> reescala linealmente el valor medido al rango físico de ingeniería: de <strong>0° a 40°</strong> de recorrido de la suspensión.',
        'Detalle crucial de calibración en el coche: el mapeo debe ajustarse contra el <strong>rango real medido</strong> con el divisor instalado, no con el valor teórico máximo del ADC. Si el divisor limita la salida a 3.0V, el ADC llegará máximo a ~3720 (en 12 bits), por lo que debemos calibrar contra 3720.'
      ]
    },

    {
      type: 'lab',
      heading: 'Pruébalo: mueve la suspensión y observa la alerta de ángulo'
    }
  ],

  decisionTable: {
    caption: 'Comparación de tecnologías para medición de posición y suspensión en vehículos',
    headers: ['Tecnología', 'Tipo de salida', 'Ventajas en Baja SAE', 'Desventajas / Riesgos', 'Uso en MadRams'],
    rows: [
      ['Potenciómetro OEM sellado', 'Voltaje analógico lineal (0–Vcc)', 'Bajo costo, lectura instantánea sin latencia, muy robusto', 'Desgaste mecánico con los años si entra lodo', 'Recorrido de suspensión (GM 15098628)'],
      ['Sensor LVDT (Transformador diferencial)', 'Señal AC modulada / analógica', 'Sin contacto, precisión de micras, vida útil infinita', 'Muy costoso, voluminoso, requiere acondicionador', 'No usado (excede presupuesto)'],
      ['Encoder magnético sin contacto (AS5600)', 'Bus I²C / PWM / Analógico', 'Cero desgaste mecánico, tolera lodo y agua 100%', 'Requiere imán diametral alineado a menos de 2 mm', 'Ángulo de volante y RPM CVT (Sesión 5)'],
      ['Sensor ultrasónico / ToF láser', 'Digital I²C / UART', 'Mide altura al piso directamente', 'El lodo y agua en la lente bloquean la medición', 'Pruebas estáticas de altura libre en taller']
    ]
  },

  reference: {
    intro: 'El divisor de voltaje divide la tensión proporcionalmente según la relación de resistores en serie. El ADC convierte esa fracción de voltaje en un entero cuantizado.',
    formulas: [
      {
        label: 'Ecuación general del divisor de voltaje',
        code: 'V_out = V_in * (R2 / (R1 + R2))\n// Ejemplo: V_in = 5.0V, R1 = 10kΩ, R2 = 15kΩ:\nV_out = 5.0 * (15000 / 25000) = 3.0 V (seguro para pin de 3.3V)'
      },
      {
        label: 'Conversión de lectura analógica a ángulo con calibración real',
        code: 'int crudo = analogRead(PIN_SUSP);\n// Reescalado calibrado de 0..3720 a 0..40 grados:\nfloat angulo = map(crudo, 0, 3720, 0, 40);'
      }
    ],
    tables: [
      {
        caption: 'Resolución de ADC según arquitectura de microcontrolador',
        headers: ['Microcontrolador', 'Bits de resolución', 'Niveles discretos', 'Voltaje de referencia', 'Resolución por bit (mV/LSB)'],
        rows: [
          ['Arduino Uno (ATmega328P)', '10 bits', '1024 (0 a 1023)', '5.0 V', '4.88 mV por paso'],
          ['Arduino Nano Every', '10 bits', '1024 (0 a 1023)', '5.0 V', '4.88 mV por paso'],
          ['ESP32 / ESP32-S3', '12 bits', '4096 (0 a 4095)', '3.3 V', '0.80 mV por paso'],
          ['ADS1115 (ADC externo I2C)', '16 bits', '65536 (-32768 a 32767)', 'Prog (ej. 4.096V)', '0.125 mV por paso']
        ]
      }
    ]
  },

  errors: [
    'Conectar 5V directo a un pin del ESP32 sin divisor: destruye el canal del ADC de forma instantánea y permanente.',
    'Terminales del potenciómetro invertidas o cursor flotando: si una de las patas extremas queda suelta, el pin analógico "flota" captando ruido capacitivo y dando lecturas que saltan aleatoriamente.',
    'Mapear con 1023 cuando el microcontrolador es de 12 bits (4095): provoca un error de escala de un factor ×4 en el cálculo del ángulo.',
    'No considerar la tolerancia de las resistencias del divisor (ej. 5% o 1%): altera el voltaje real máximo y requiere ajustar los límites del map().'
  ],

  deliverable: {
    title: 'Práctica Wokwi: Sensor de Suspensión con Divisor y Alarma',
    items: [
      'Link al proyecto Wokwi con potenciómetro simulando el sensor GM, circuito divisor de voltaje y LED indicador de sobre-recorrido.',
      'Captura de pantalla del monitor serial demostrando el cálculo correcto de grados (0° a 40°) y la activación del indicador al superar los 25°.',
      'README con el cálculo teórico del divisor de voltaje justificando los valores de R1 y R2 elegidos.',
      'Código fuente con constantes significativas y función map() calibrada.'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'Cálculo del divisor de voltaje y justificación de protección del microcontrolador ', weight: '30%' },
    { criterion: 'Calibración correcta de la función map() y conversión analógica a grados de recorrido ', weight: '25%' },
    { criterion: 'Implementación funcional del umbral de alarma de sobre-recorrido >25° ', weight: '25%' },
    { criterion: 'Código limpio, modular, constantes con nombre y sin números mágicos ', weight: '20%' }
  ],

  bibliography: [
    'General Motors (2018) — GM OEM Ride Height Sensor Specifications (Part 15098628/15098629 Rotary Potentiometer).',
    'Espressif Systems (2024) — ESP32 Technical Reference Manual: Section 28 (Analog-to-Digital Converter / ADC Characteristics).',
    'Arduino Documentation (2024) — Language Reference: analogRead() & map() Mathematical Foundations.',
    'Scherz, P., & Monk, S. (2016) — Practical Electronics for Inventors (4th ed.). McGraw-Hill: Voltage Dividers and Potentiometric Sensors.'
  ],

  cta: {
    label: 'Ver instrucciones completas y retos en Notion →',
    url: 'https://balsam-ringer-081.notion.site/Pr-ctica-3a5b2fdbb6b981a8a4bcffe70053f8fe'
  },

  prev: { label: '02 · Fundamentos PRIMM (termostato)', url: '../sesion-2/' },
  next: { label: '04 · Temperatura (DS18B20 + 1-Wire)', url: '../sesion-4/' }
};
