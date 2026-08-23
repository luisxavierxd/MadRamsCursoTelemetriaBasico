window.SESSION_DATA = {
  slug: 'sesion-2',
  number: '02',
  icon: '⚡',
  title: 'Fundamentos de programación — PRIMM (alarma de sobrecalentamiento)',
  quote: 'La histéresis no es un truco: es la diferencia entre un sistema de telemetría confiable y una radio saturada con ráfagas de falsas alarmas.',
  badges: [
    '1:30h (35 min teoría / 55 min PRIMM)',
    'Simulación en Wokwi (sin hardware físico)',
    'Entregable: Wokwi + histéresis de alarma demostrada'
  ],

  wokwi: {
    url: 'https://wokwi.com/projects/424683074818788353',
    titulo: 'MadRams S2 · Alarma de Sobrecalentamiento con Histéresis'
  },

  simulator: {
    type: 'thermostat-sim',
    title: 'Laboratorio interactivo: alarma de sobrecalentamiento, histéresis y chattering',
    caption: 'Mueve el potenciómetro de temperatura: observa cómo la alerta conmuta en 95°C de subida y 88°C de bajada evitando ráfagas de falsas alertas a pits, y experimenta el chattering si eliminas la histéresis.'
  },

  model: {
    label: 'ESP32-WROOM-32S',
    alt: 'Modelo 3D del microcontrolador ESP32-WROOM-32S',
    src: '../../assets/models/ESP32Wroom32s.glb',
    orientation: '0deg 0deg 0deg',
    specs: [
      { k: 'MCU', v: 'ESP32 Dual-Core Tensilica Xtensa LX6 (240 MHz)' },
      { k: 'ADC interno', v: '12 bits (rango 0–4095, 0–3.3V)' },
      { k: 'Flash / SRAM', v: '4 MB Flash / 520 KB SRAM' },
      { k: 'Pin sensor (Wokwi)', v: 'GPIO 34 (ADC1_CH6, entrada analógica)' },
      { k: 'Pin alarma/alerta', v: 'GPIO 2 (salida digital / LED indicador a pits)' },
      { k: 'Umbral alerta ON', v: '<span class="hl">95.0 °C</span> (subiendo — dispara alarma a pits)' },
      { k: 'Umbral alerta OFF', v: '<span class="hl">88.0 °C</span> (bajando — temperatura normalizada)' },
      { k: 'Banda muerta', v: '7.0 °C de histéresis anti-chattering' }
    ]
  },

  lesson: [
    {
      type: 'callout',
      heading: 'Conexión con MadRams: ¿por qué una alarma con histéresis a pits?',
      body: 'En el coche Minibaja SAE <strong>no tenemos ventilador activo</strong>: el enfriamiento del motor y la CVT depende del flujo de aire durante la marcha. Por eso es vital que la telemetría vigile la temperatura constantemente y <strong>emita una alerta inmediata a pits</strong> si sobrepasa el límite seguro. Pero un sensor con vibración y ruido eléctrico oscila constantemente: sin histéresis, la ECU saturaría el enlace de radio enviando y cancelando alertas decenas de veces por segundo. La lógica de esta sesión enseña a construir alertas limpias y estables con memoria de estado.'
    },

    {
      type: 'concept',
      heading: 'Sintaxis desde cero: variables, tipos de datos y Monitor Serial',
      body: [
        'En C++ debes indicarle al microcontrolador <strong>qué tipo de dato</strong> guardará cada variable antes de usarla:',
        '• <code>int</code> (Entero): Guarda números sin decimales (ej. <code>int pin = 34;</code> o <code>int crudo = 2048;</code>).',
        '• <code>float</code> (Flotante / Decimal): Guarda números con punto decimal (ej. <code>float temp = 95.5;</code>). En C++ los decimales se escriben siempre con punto (<code>.</code>), nunca con coma.',
        '• <code>bool</code> (Booleano / Bandera): Solo puede guardar dos estados: <code>true</code> (verdadero / 1) o <code>false</code> (falso / 0). Es la variable ideal para recordar si una alarma está encendida o apagada (memoria del sistema).',
        '• <code>const</code> (Constante): Palabra clave que se antepone para indicar que ese valor <strong>nunca cambiará</strong> durante la carrera (ej. <code>const int PIN_SENSOR = 34;</code>). Evita errores accidentales.',
        '• <strong>Monitor Serial:</strong> Para ver datos en la pantalla de la computadora, iniciamos el puerto en el <code>setup()</code> con <code>Serial.begin(115200);</code> (velocidad en baudios). Luego usamos <code>Serial.print(...)</code> para imprimir texto y <code>Serial.println(...)</code> para imprimir con un salto de línea al final.'
      ],
      code: '// Declaración de variables y constantes\nconst int PIN_SENSOR = 34;       // Constante entera para el pin\nconst float T_MAX = 130.0;       // Constante decimal en grados Celsius\nbool alarmaActiva = false;       // Bandera booleana de estado\n\nvoid setup() {\n  Serial.begin(115200);          // Inicia comunicación USB con la PC\n  Serial.println("Telemetria MadRams iniciada...");\n}',
      teacher: 'Asegura que comprendan la diferencia entre Serial.print (imprime en la misma línea) y Serial.println (imprime y da Enter para la siguiente línea).'
    },

    {
      type: 'concept',
      heading: 'Sintaxis desde cero: estructuras de decisión (if, else if, else) y operadores',
      body: [
        'Las estructuras condicionales permiten que la ECU tome decisiones automáticas según el valor de los sensores:',
        '• <code>if (condición) { ... }</code>: Ejecuta el bloque entre llaves <strong>únicamente si la condición es verdadera</strong>.',
        '• <code>else if (otra_condición) { ... }</code>: Se evalúa solo si el <code>if</code> anterior resultó falso.',
        '• <code>else { ... }</code>: Se ejecuta si ninguna de las condiciones anteriores se cumplió.',
        '<strong>Operadores de comparación indispensables:</strong>',
        '• <code>>=</code> (mayor o igual que) · <code><=</code> (menor o igual que) · <code>></code> (mayor que) · <code><</code> (menor que).',
        '• <code>==</code> (¿es exactamente igual?): ⚠️ <strong>¡Cuidado!</strong> Un solo igual (<code>=</code>) es de <em>asignación</em> (guarda un valor en la variable); dos iguales (<code>==</code>) es de <em>comparación</em>.',
        '• <code>!=</code> (¿es diferente de?).',
        '• <code>&&</code> (Y lógico — AND): Ambas condiciones deben cumplirse.',
        '• <code>||</code> (O lógico — OR): Al menos una condición debe cumplirse.',
        '• <code>!</code> (NO lógico — NOT): Invierte el valor (ej. <code>!alarmaActiva</code> significa "si la alarma NO está activa").'
      ],
      teacher: 'El error más común en C++ de primer ingreso es escribir if (x = 5) en lugar de if (x == 5). Explica que el compilador reescribe el valor en vez de compararlo.'
    },

    {
      type: 'concept',
      heading: 'Metodología PRIMM: cómo aprenderemos código hoy',
      body: [
        'En ingeniería de telemetría no escribimos código desde una pantalla en blanco. Tomamos sistemas funcionales, los analizamos, los probamos bajo estrés y los modificamos para cumplir nuevos requerimientos.',
        'La metodología <strong>PRIMM</strong> (Sentance et al., 2019) divide el aprendizaje en 5 pasos estructurados:',
        '<strong>1. Predict (Predecir):</strong> Leemos el código y deducimos qué hará antes de correrlo.',
        '<strong>2. Run (Ejecutar):</strong> Corremos el simulador y contrastamos la realidad con nuestra hipótesis.',
        '<strong>3. Investigate (Investigar):</strong> Modificamos variables clave, provocamos fallas y respondemos preguntas guiadas.',
        '<strong>4. Modify (Modificar):</strong> Agregamos nuevas funciones escalonadas al programa.',
        '<strong>5. Make (Crear):</strong> Diseñamos una solución propia para un caso de uso del coche.'
      ],
      teacher: 'Asegurar que los alumnos NO abran el simulador durante la fase Predict. La discusión en parejas sobre la pregunta 3 (90°C) es el núcleo pedagógico de la sesión.'
    },

    {
      type: 'concept',
      heading: 'El código base de la alarma de sobrecalentamiento',
      body: [
        'Este es el sketch inicial que corre en el simulador Wokwi. El potenciómetro simula el sensor de temperatura del motor/CVT (60 °C a 130 °C) y el LED en el pin 2 representa el indicador de alerta a pits:'
      ],
      code: '// Alarma de sobrecalentamiento a pits — MadRams, Sesión 2\n// El potenciómetro simula el sensor de temperatura de CVT / motor.\n\nconst int PIN_SENSOR = 34;   // potenciómetro analógico\nconst int PIN_ALARMA = 2;    // LED indicador / bit de alarma a pits\n\nconst float T_ALARMA_ON  = 95.0;   // °C (umbral superior de sobrecalentamiento)\nconst float T_ALARMA_OFF = 88.0;   // °C (umbral inferior de recuperación)\n\nbool alarmaActiva = false; // Variable de estado (memoria del sistema)\n\nfloat leerTemperatura() {\n  int crudo = analogRead(PIN_SENSOR);          // 0..4095 (ADC de 12 bits)\n  return 60.0 + (crudo * (130.0 - 60.0) / 4095.0);   // 60..130 °C\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(PIN_ALARMA, OUTPUT);\n}\n\nvoid loop() {\n  float t = leerTemperatura();\n\n  // Lógica de histéresis: solo cambia el estado de alarma al cruzar los extremos\n  if (!alarmaActiva && t >= T_ALARMA_ON) {\n    alarmaActiva = true;   // Cruce de subida: sobrecalentamiento\n  } else if (alarmaActiva && t <= T_ALARMA_OFF) {\n    alarmaActiva = false;  // Cruce de bajada: temperatura normalizada\n  }\n\n  digitalWrite(PIN_ALARMA, alarmaActiva ? HIGH : LOW);\n\n  Serial.print("T=");\n  Serial.print(t, 1);\n  Serial.print(" C  alerta_pits=");\n  Serial.println(alarmaActiva ? "1 (ALERTA)" : "0 (OK)");\n\n  delay(200);\n}',
      teacher: 'Explicar la conversión matemática de analogRead (0-4095) a grados Celsius (60-130 °C).'
    },

    {
      type: 'concept',
      heading: 'Variables de estado e histéresis vs. Chattering',
      body: [
        '¿Por qué no usamos simplemente <code>if (t >= 90.0) encenderAlarma(); else apagarAlarma();</code>?',
        'En un entorno real de competencia con vibración y ruido eléctrico, la lectura de temperatura oscila constantemente (por ejemplo: 89.9 °C → 90.1 °C → 89.9 °C). Con un solo umbral, el sistema conmutaría la alarma <strong>decenas de veces por segundo</strong>.',
        'Este fenómeno se llama <strong>chattering</strong> (rebote o cascabeleo). En un sistema telemétrico, inundaría el enlace de radio enviando ráfagas innecesarias de paquetes de alerta y confundiendo a los ingenieros en pits.',
        'La solución es la <strong>histéresis</strong>: definir dos umbrales separados creando una <em>banda muerta</em> (en este caso de 88 °C a 95 °C). Dentro de esa banda, el sistema <strong>recuerda su estado anterior</strong> gracias a la variable booleana <code>alarmaActiva</code>.'
      ],
      teacher: 'Hacer énfasis en la banda muerta (7°C entre 88 y 95). Preguntar qué pasa con el radio de telemetría si una alarma oscila sin cesar.'
    },

    {
      type: 'activity',
      heading: 'Práctica guiada: Las 5 fases de PRIMM',
      time: '55 min',
      prompt: 'Sigue la secuencia de trabajo en parejas en el simulador Wokwi:',
      steps: [
        '<strong>P — Predict (10 min, en papel, sin tocar el simulador):</strong> Contesta: 1) ¿Qué estado tiene la alarma a 70 °C? 2) ¿Qué hace a 96 °C? 3) Si la temperatura está exactamente en 90 °C, ¿la alarma está activa o inactiva? (<em>Pista: reflexiona si falta información para responder la 3</em>).',
        '<strong>R — Run (10 min):</strong> Abre el proyecto Wokwi. Mueve el potenciómetro lentamente hacia arriba hasta que el LED de alarma encienda y anota la temperatura exacta. Luego bájalo lentamente hasta que se apague y anota el valor. Compara con tus predicciones.',
        '<strong>I — Investigate (15 min):</strong> 1) Rastrea la variable <code>alarmaActiva</code>: ¿quién la modifica y bajo qué condición exacta? Dibuja el diagrama de 2 estados y las 2 flechas de transición. 2) Cambia el código a <code>T_ALARMA_ON = T_ALARMA_OFF = 90.0</code>, corre el simulador y deja el potenciómetro en 90 °C: describe qué ocurre en el monitor serial (chattering). 3) Cambia <code>delay(200)</code> a <code>delay(2000)</code>: ¿qué problema causa esto en la respuesta de alerta? 4) Explica por qué se usa <code>else if</code> en vez de dos bloques <code>if</code> independientes.',
        '<strong>M — Modify (10 min):</strong> Elige e implementa una de estas mejoras: <em>(a) Nivel Fácil:</em> Agregar un segundo LED de alarma crítica en el pin 4 que encienda si T &gt; 110 °C. <em>(b) Nivel Medio:</em> Imprimir en el monitor serial <em>únicamente cuando el estado de la alarma cambia</em>, evitando inundar la consola y el radio. <em>(c) Nivel Avanzado:</em> Mantener la alerta activa al menos 5 segundos con <code>millis()</code> una vez disparada.',
        '<strong>M — Make (10 min):</strong> Diseña una variante: configura dos bandas de histéresis distintas (Motor 95°/88° vs CVT 90°/82°) o agrega un botón físico de "Prueba de Alarma" que fuerce la alerta a pits para verificar la comunicación en pits.'
      ],
      output: 'Link a tu proyecto Wokwi público + captura del monitor serial demostrando conmutación a 95°C y 88°C + respuestas a las 4 preguntas de Investigate en el README.',
      hint: 'A 90 °C la respuesta correcta es: depende de si la temperatura venía subiendo desde frío (estará inactiva) o venía bajando desde sobrecalentamiento (estará activa).'
    },

    {
      type: 'lab',
      heading: 'Laboratorio: experimenta la histéresis y el chattering'
    },

    {
      type: 'concept',
      heading: 'Conceptos que quedan sembrados para las siguientes sesiones',
      body: [
        'Lo que aprendiste hoy no se queda en esta sesión, es la base de la arquitectura de telemetría completa:',
        '• <strong>Variables de estado (flags):</strong> En la Sesión 5 las usarás para controlar el flujo de tramas en los buses I²C y SPI.',
        '• <strong>Histéresis en telemetría:</strong> En el curso Avanzado (A5) programarás los umbrales de alarma del dashboard de pits de Grafana para que las alertas visuales no parpadeen.',
        '• <strong>Temporización no bloqueante con millis():</strong> En el curso Intermedio (I4) será la base para ejecutar múltiples tareas concurrentes en FreeRTOS sin usar <code>delay()</code>.',
        '• <strong>Frecuencia de muestreo:</strong> En Intermedio (I6) estudiarás el teorema de Nyquist para saber con qué frecuencia leer cada sensor del chasis.'
      ]
    }
  ],

  decisionTable: {
    caption: 'Estrategias de monitoreo de umbrales y alertas en telemetría',
    headers: ['Estrategia', 'Complejidad', 'Comportamiento en umbral', 'Cuándo sí en el coche', 'Cuándo no'],
    rows: [
      [
        'Umbral simple (<code>t >= 90</code>)',
        'Mínima (1 if)',
        'Chattering destructivo: conmuta decenas de veces por segundo con ruido',
        'Nunca en telemetría en vivo ni cargas de potencia',
        'Alertas a pits, flags de radio, relevadores'
      ],
      [
        'Histéresis (95° ON / 88° OFF)',
        'Baja (1 variable bool + 2 umbrales)',
        'Conmutación limpia; banda muerta de 7 °C que absorbe el ruido',
        'Alertas de temperatura de motor/CVT a pits, luces de advertencia',
        'Variables que requieren reporte continuo analógico'
      ],
      [
        'Tiempo mínimo con <code>millis()</code>',
        'Media (timestamp <code>uint32_t</code>)',
        'Garantiza que la alerta permanezca visible en pits al menos N segundos',
        'Eventos térmicos fugaces, bombas de lubricación',
        'Paradas de emergencia o alarmas críticas instantáneas'
      ],
      [
        'Filtro móvil / Media exponencial',
        'Media (cálculo ponderado en ventana)',
        'Suaviza el ruido analógico antes de evaluar umbrales',
        'Señales ruidosas de suspensión, corriente de batería',
        'Señales que requieren respuesta al milisegundo'
      ]
    ]
  },

  reference: {
    intro: 'Resumen de sintaxis de C++, tipos de datos y la estructura matemática de histéresis y escalado de ADC.',
    formulas: [
      {
        label: 'Tipos de datos y operadores en C++ (Guía de Referencia)',
        code: 'int sensor = 34;             // Enteros (-32768 a 32767 o 32-bit en ESP32)\nfloat temp = 95.5;           // Decimales con punto\nbool alerta = false;         // Booleano (true / false)\n\n// Operadores de comparación:\n// == (igual a)   != (diferente)   > (mayor)   < (menor)   >= (mayor o igual)\n// && (Y lógico)   || (O lógico)    ! (NO lógico)'
      },
      {
        label: 'Conversión de lectura analógica (ADC 12 bits) a temperatura (°C)',
        code: 'float t = T_MIN + (crudo * (T_MAX - T_MIN) / 4095.0);\n// Ejemplo: crudo = 2048 → t = 60.0 + (2048 * 70.0 / 4095.0) ≈ 95.0 °C'
      },
      {
        label: 'Estructura canónica de histéresis con variable booleana de estado',
        code: 'if (!alarmaActiva && t >= T_ALARMA_ON) {\n  alarmaActiva = true;  // Cruce de subida\n} else if (alarmaActiva && t <= T_ALARMA_OFF) {\n  alarmaActiva = false; // Cruce de bajada\n}'
      },
      {
        label: 'Temporizador no bloqueante con millis() (Modificación Nivel Avanzado)',
        code: 'if (alarmaActiva && (millis() - tiempoAlarma >= TIEMPO_MINIMO)) {\n  if (t <= T_ALARMA_OFF) {\n    alarmaActiva = false;\n  }\n}'
      }
    ],
    tables: [
      {
        caption: 'Puntos de operación y estado de la alarma a pits',
        headers: ['Temperatura', 'Dirección del cambio', 'Estado de la alarma', 'Razón técnica'],
        rows: [
          ['75.0 °C', 'Subiendo o bajando', 'OFF (Inactiva)', 'Inferior a ambos umbrales'],
          ['90.0 °C', 'Subiendo desde frío', 'OFF (Inactiva)', 'No ha alcanzado el umbral de sobrecalentamiento (95 °C)'],
          ['96.0 °C', 'Subiendo o bajando', 'ON (Alarma en Pits)', 'Superó el umbral superior de activación'],
          ['90.0 °C', 'Bajando desde caliente', 'ON (Alarma en Pits)', 'No ha bajado del umbral de recuperación (88 °C)'],
          ['87.5 °C', 'Bajando desde caliente', 'OFF (Inactiva)', 'Cruzó hacia abajo el umbral de desactivación']
        ]
      }
    ]
  },

  errors: [
    'Confundir asignación (<code>=</code>) con comparación (<code>==</code>): escribir <code>if (alarmaActiva = true)</code> sobreescribe la variable a verdadero en lugar de compararla, haciendo que la condición siempre se cumpla.',
    'Evaluar <code>t >= 95</code> sin verificar la variable de estado: si solo pones <code>if (t >= 95) digitalWrite(PIN, HIGH); else if (t <= 88) digitalWrite(PIN, LOW);</code> sin recordar el estado, la zona intermedia 88–95 °C queda sin definición explícita.',
    'Usar dos <code>if</code> independientes consecutivos en lugar de <code>if / else if</code>: si las condiciones se solapan por error de lógica, el indicador de alarma puede encender y apagarse en la misma pasada del loop.',
    'Mapear el ADC con 1023 en vez de 4095: el Arduino Uno tiene ADC de 10 bits (0–1023), pero el ESP32 tiene ADC de 12 bits (0–4095). Dividir entre 1023 cuadruplica el valor calculado y dispara alarmas falsas.',
    'Usar <code>delay(5000)</code> para pausar el loop: la función <code>delay()</code> congela la CPU por completo, impidiendo leer la IMU, el GPS o transmitir por LoRa durante esos 5 segundos.'
  ],

  deliverable: {
    title: 'Proyecto Wokwi con Histéresis de Alarma Demostrada',
    items: [
      'Link público al proyecto de Wokwi funcionando con ESP32, potenciómetro y LED.',
      'Captura de pantalla clara del monitor serial demostrando el ciclo térmico completo: alarma activa al cruzar 95.0 °C de subida y restablecida al cruzar 88.0 °C de bajada.',
      'README en el proyecto con las respuestas a las 4 preguntas de la fase <strong>Investigate</strong> (incluyendo el análisis del chattering y el diagrama de estados).',
      'Código fuente con al menos una de las modificaciones de la fase <strong>Modify</strong> (alarma crítica &gt;110°C, filtro serial o millis) implementada y comentada.'
    ],
    format: 'Subir a la tarea correspondiente en Microsoft Teams (según las instrucciones y enlaces activos en Notion)'
  },

  rubric: [
    { criterion: 'La alarma conmuta en dos umbrales distintos demostrados en la captura serial ', weight: '30%' },
    { criterion: 'La modificación seleccionada de la fase Modify funciona correctamente en simulación ', weight: '25%' },
    { criterion: 'Explica con rigor técnico por qué la histéresis evita el chattering en el radio telemétrico ', weight: '25%' },
    { criterion: 'Código limpio, legible, con constantes con nombre y sin números mágicos ', weight: '20%' }
  ],

  bibliography: [
    'Sentance, S.; Waite, J.; Kallia, M. (2019) — Teaching computer programming with PRIMM: a sociocultural perspective. Computer Science Education, 29(2-3), 136-173.',
    'Raspberry Pi Foundation — The PRIMM Approach to Teaching Programming. Hello World Issue #8 & Teach Computing Curriculum.',
    'Espressif Systems (2024) — ESP32 Technical Reference Manual: Section 28 (On-Chip Sensors and Analog-to-Digital Converter ADC).',
    'Arduino Documentation — Language Reference: Control Structure (if / else if), Boolean Variables and Non-blocking millis() Timing.'
  ],

  cta: {
    label: 'Ver instrucciones completas y retos en Notion →',
    url: 'https://balsam-ringer-081.notion.site/Pr-ctica-S2-Termostato-3a5b2fdbb6b981238dddf6d0e0041c33'
  },

  prev: { label: '01 · Electricidad + Arduino', url: '../sesion-1/' },
  next: { label: '03 · Suspensión (potenciómetro)', url: '../sesion-3/' }
};
