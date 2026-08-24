(function () {
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function renderHeader(data) {
    var currentNum = parseInt(data.number, 10) || 0; // '01'→1 … '06'→6
    var titles = window.COURSE_SESSION_TITLES || [
      '01 · Electricidad + Arduino',
      '02 · Fundamentos PRIMM (termostato)',
      '03 · Suspensión (potenciómetro)',
      '04 · Temperatura (DS18B20 + 1-Wire)',
      '05 · Bus I²C (MPU6050 + AS5600)',
      '06 🏁 · GPS + MicroSD (Data Day)'
    ];
    function dot(n, extraClass) {
      var label = titles[n - 1] || ('Sesión ' + n);
      var cls = 'nav-dot' + (extraClass ? ' ' + extraClass : '');
      if (n < currentNum) cls += ' is-done';
      else if (n === currentNum) cls += ' is-current';
      var attrs = { href: '../sesion-' + n + '/', class: cls, 'aria-label': label, title: label };
      if (n === currentNum) attrs['aria-current'] = 'true';
      return el('a', attrs, [label]);
    }
    var dots = [1, 2, 3, 4, 5].map(function (n) { return dot(n, ''); });
    dots.push(dot(6, 'nav-dot--bonus'));
    return el('header', { class: 'site-header' }, [
      el('div', { class: 'container' }, [
        el('a', { class: 'site-header__brand', href: '../../index.html' }, [
          el('img', { src: '../../assets/img/LogoMadrams.png', alt: 'MadRams' }),
          document.createTextNode('Curso Telemetría')
        ]),
        el('ul', { class: 'nav-dots' }, dots)
      ])
    ]);
  }

  // ---- Firma del hero (§4): una por curso, elegida por window.COURSE_SIGNATURE ----
  var BUS_SCL = 'M 48 34 L 64 34 L 64 62 L 95 62 L 95 34 L 126 34 L 126 62 L 157 62 L 157 34 L 188 34 L 188 62 L 219 62 L 219 34 L 250 34 L 250 62 L 281 62 L 281 34 L 312 34 L 312 62 L 343 62 L 343 34 L 374 34 L 374 62 L 405 62 L 405 34 L 436 34 L 436 62 L 467 62 L 467 34 L 498 34 L 498 62 L 529 62 L 529 34 L 560 34 L 600 34';
  var BUS_SDA = 'M 48 96 L 50 96 L 50 124 L 64 124 L 64 96 L 126 96 L 126 96 L 126 124 L 188 124 L 188 124 L 188 96 L 250 96 L 250 96 L 250 124 L 312 124 L 312 124 L 312 124 L 374 124 L 374 124 L 374 96 L 436 96 L 436 96 L 436 96 L 498 96 L 498 96 L 498 124 L 560 124 L 560 124 L 560 96 L 600 96';

  function busTraceNode() {
    var svg = '<svg class="hero-bus circuit-trace" viewBox="0 0 640 150" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<text x="6" y="53" class="hero-bus__lbl">SCL</text>' +
      '<text x="6" y="115" class="hero-bus__lbl">SDA</text>' +
      '<path class="hero-bus__scl" d="' + BUS_SCL + '" fill="none" stroke-width="2.5" stroke-dasharray="1400"/>' +
      '<path class="hero-bus__sda" d="' + BUS_SDA + '" fill="none" stroke-width="2.5" stroke-dasharray="1400"/>' +
      '</svg>';
    var fields = ['START', 'DIRECCIÓN 7b', 'R/W', 'ACK', 'DATO 8b', 'STOP'];
    return el('div', { class: 'hero-signature hero-signature--bus' }, [
      el('div', { class: 'hero-signature__eyebrow' }, ['I²C · analizador lógico']),
      el('div', { html: svg }),
      el('div', { class: 'hero-bus__legend' }, fields.map(function (f) { return el('span', { class: 'hero-bus__field' }, [f]); }))
    ]);
  }

  function sequenceTapeNode() {
    var total = 16;
    var missing = { 3: 1, 4: 1, 10: 1 };
    var cells = [];
    for (var i = 0; i < total; i++) {
      cells.push(el('div', { class: 'seq-cell' + (missing[i] ? ' seq-cell--miss' : '') }, [String(i + 1)]));
    }
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      setTimeout(function () {
        var missCells = cells.filter(function (c) { return c.classList.contains('seq-cell--miss'); });
        function cycle() {
          missCells.forEach(function (c, i) {
            setTimeout(function () { c.classList.add('seq-cell--filled'); }, i * 260);
          });
          setTimeout(function () { missCells.forEach(function (c) { c.classList.remove('seq-cell--filled'); }); }, 2600);
        }
        cycle();
        setInterval(cycle, 4200);
      }, 700);
    }
    return el('div', { class: 'hero-signature hero-signature--seq' }, [
      el('div', { class: 'hero-signature__eyebrow' }, ['Radio · secuencia de paquetes']),
      el('div', { class: 'seq-tape' }, cells),
      el('div', { class: 'hero-bus__legend' }, [
        el('span', { class: 'hero-bus__field' }, ['huecos = pérdida de radio']),
        el('span', { class: 'hero-bus__field' }, ['se rellenan desde la SD'])
      ])
    ]);
  }

  function buildHeroVisual(data) {
    if (data.hero && data.hero.type) {
      var heroWrap = el('div', { class: 'session-hero__custom-hero', id: 'session-hero-mount' });
      setTimeout(function () {
        if (window.TelemetryHeroes && typeof window.TelemetryHeroes[data.hero.type] === 'function') {
          window.TelemetryHeroes[data.hero.type](heroWrap, data.hero.params || {});
        }
      }, 0);
      return heroWrap;
    }
    var sig = window.COURSE_SIGNATURE;
    if (sig === 'bus-trace') return busTraceNode();
    if (sig === 'sequence-tape') return sequenceTapeNode();
    var traceSvg = '<svg class="circuit-trace session-hero__trace" viewBox="0 0 300 40" ' +
      'preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<path d="M0 30 L60 30 L60 15 L140 15 L140 30 L220 30 L220 10 L300 10" ' +
      'fill="none" stroke="var(--blue-royal, #2547E0)" stroke-width="2" stroke-dasharray="900" /></svg>';
    return el('div', { class: 'session-hero__trace-wrap', html: traceSvg });
  }

  function renderHero(data) {
    var badges = (data.badges || []).map(function (b) { return el('span', { class: 'badge' }, [b]); });
    var children = [
      el('span', { class: 'num' }, [data.icon + ' ' + data.number]),
      el('h1', {}, [data.title]),
      el('p', { class: 'quote' }, [data.quote]),
      el('div', { class: 'badges' }, badges),
      buildHeroVisual(data)
    ];
    return el('section', { class: 'session-hero' }, [
      el('div', { class: 'container' }, children)
    ]);
  }

  function renderTable(t) {
    var thead = el('thead', {}, [el('tr', {}, t.headers.map(function (h) { return el('th', {}, [h]); }))]);
    var tbody = el('tbody', {}, t.rows.map(function (row) {
      return el('tr', {}, row.map(function (cell) { return el('td', { html: String(cell) }, []); }));
    }));
    return el('div', { class: 'table-wrap' }, [
      t.caption ? el('p', { class: 'table-caption' }, [t.caption]) : null,
      el('table', { class: 'data-table' }, [thead, tbody])
    ]);
  }

  function renderReference(data) {
    var ref = data.reference || {};
    if (!ref.intro && !(ref.formulas && ref.formulas.length) && !(ref.tables && ref.tables.length) && !ref.diagram) return null;
    var blocks = [];
    if (ref.diagram) {
      blocks.push(el('figure', { class: 'diagram' }, [
        el('img', { src: ref.diagram.src, alt: ref.diagram.alt, loading: 'lazy' }),
        el('figcaption', { class: 'table-caption' }, [ref.diagram.caption])
      ]));
    }
    if (ref.intro) blocks.push(el('p', {}, [ref.intro]));
    (ref.formulas || []).forEach(function (f) {
      blocks.push(el('div', { class: 'formula-item' }, [
        el('div', { class: 'formula-label' }, [f.label]),
        el('code', { class: 'formula' }, [f.code])
      ]));
    });
    (ref.tables || []).forEach(function (t) { blocks.push(renderTable(t)); });
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, ['Referencia rápida']),
        el('div', { class: 'reference-block reveal' }, blocks)
      ])
    ]);
  }

  function renderDecisionTable(data) {
    if (!data.decisionTable) return null;
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, ['Cuándo usar qué']),
        el('div', { class: 'decision-table reveal' }, [renderTable(data.decisionTable)])
      ])
    ]);
  }

  function renderErrors(data) {
    var items = data.errors.map(function (e) { return el('li', { class: 'checklist__item', html: e }, []); });
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, ['Errores comunes']),
        el('ul', { class: 'checklist reveal' }, items)
      ])
    ]);
  }

  function renderDeliverable(data) {
    if (!data.deliverable) return null;
    var d = data.deliverable;
    var items = (d.items || []).map(function (it) { return el('li', { html: it }, []); });
    var kids = [
      el('div', { class: 'deliverable__eyebrow' }, ['Entregable']),
      el('h3', {}, [d.title || 'Entregable de la sesión'])
    ];
    if (items.length) kids.push(el('ul', { class: 'deliverable__list' }, items));
    if (d.format) kids.push(el('p', { class: 'deliverable__format' }, ['Formato: ' + d.format]));
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [el('div', { class: 'deliverable-box reveal' }, kids)])
    ]);
  }

  function renderRubric(data) {
    if (!data.rubric || !data.rubric.length) return null;
    var rows = data.rubric.map(function (r) {
      var critText = (r.criterion || '').replace(/\s*\(\s*\d+\s*%\s*\)\s*$/, '');
      return el('div', { class: 'rubric__row' }, [
        el('span', { class: 'rubric__crit', html: critText }, []),
        el('span', { class: 'rubric__weight' }, [r.weight || ''])
      ]);
    });
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, ['Rúbrica de evaluación']),
        el('div', { class: 'rubric reveal' }, rows)
      ])
    ]);
  }

  function renderSafety(data) {
    if (!data.safety) return null;
    var s = data.safety;
    var rules = (s.rules || []).map(function (r) { return el('li', { html: r }, []); });
    var items = [
      el('h2', { class: 'reveal' }, [s.heading || 'Seguridad']),
      el('p', { class: 'reveal', html: s.body }),
      el('ul', { class: 'checklist reveal' }, rules)
    ];
    if (s.equipment) {
      items.push(el('div', { class: 'badges reveal' }, s.equipment.map(function (eq) { return el('span', { class: 'badge' }, [eq]); })));
    }
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('div', { class: 'callout callout--danger reveal' }, items)
      ])
    ]);
  }

  function renderBiblio(data) {
    if (!data.bibliography || !data.bibliography.length) return null;
    var items = data.bibliography.map(function (b) { return el('li', { html: b }, []); });
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, ['Bibliografía']),
        el('ul', { class: 'reveal' }, items)
      ])
    ]);
  }

  function renderCta(data) {
    if (!data.cta) return null;
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('a', { class: 'btn ' + (data.cta.accent ? 'btn--signal' : 'btn--primary') + ' reveal', href: data.cta.url, target: '_blank', rel: 'noopener' }, [data.cta.label])
      ])
    ]);
  }

  function renderNav(data) {
    var prev = data.prev ? el('a', { class: 'btn btn--ghost', href: data.prev.url, title: 'Ir a ' + data.prev.label }, ['← ' + data.prev.label]) : el('span', {}, []);
    var next = data.next ? el('a', { class: 'btn btn--primary', href: data.next.url, title: 'Ir a ' + data.next.label }, [data.next.label + ' →']) : el('span', {}, []);
    return el('nav', { class: 'session-nav container' }, [prev, next]);
  }

  function renderFooter() {
    return el('footer', { class: 'site-footer' }, [
      el('div', { class: 'container', style: 'display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center' }, [
        el('p', { style: 'margin:0' }, ['MadRams — Minibaja SAE. Instrucciones y retos en Notion · Entregas y retroalimentación en Microsoft Teams.']),
        el('a', { href: 'https://balsam-ringer-081.notion.site/3a5b2fdbb6b981238dddf6d0e0041c33', target: '_blank', rel: 'noopener', style: 'color:var(--text-dim)' }, ['Notion del equipo ↗'])
      ])
    ]);
  }

  function ensureModelViewer() {
    if (document.getElementById('model-viewer-cdn')) return;
    var s = document.createElement('script');
    s.id = 'model-viewer-cdn';
    s.type = 'module';
    s.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js';
    document.head.appendChild(s);
  }

  function renderModel(data) {
    if (!data.model) return null;
    var m = data.model;
    var slot;
    if (m.src) {
      ensureModelViewer();
      var mv = el('model-viewer', {
        src: m.src, alt: m.alt || m.label || 'Modelo 3D',
        'camera-controls': '', 'auto-rotate': '', 'interaction-prompt': 'none',
        'environment-image': '../../assets/models/env/studio_1k.hdr',
        'tone-mapping': 'neutral', 'exposure': '1.1',
        'shadow-intensity': '1', 'shadow-softness': '0.6'
      }, []);
      if (m.poster) mv.setAttribute('poster', m.poster);
      if (m.orientation) mv.setAttribute('orientation', m.orientation);
      slot = el('div', { class: 'model-slot' }, [mv]);
      setTimeout(function () {
        if (window.TelemetrySims && window.TelemetrySims._util) window.TelemetrySims._util.scrollRotate(mv);
      }, 0);
    } else {
      slot = el('div', { class: 'model-slot is-placeholder' }, [
        el('div', {}, [
          el('span', { class: 'model-slot__label' }, [(m.placeholder || 'Modelo 3D') + ': ' + (m.label || 'componente')]),
          el('span', { class: 'model-slot__hint' }, ['especificaciones técnicas del subsistema'])
        ])
      ]);
    }
    var kids = [slot];
    if (m.specs && m.specs.length) kids.push(buildSpecCard(m));
    return el('div', { class: 'hero-model reveal', style: 'margin-top:1.5rem;' }, kids);
  }

  function buildSpecCard(m) {
    var rows = m.specs.map(function (s) {
      return el('div', { class: 'spec-row' }, [
        el('span', { class: 'spec-k' }, [s.k]),
        el('span', { class: 'spec-v', html: s.v })
      ]);
    });
    return el('div', { class: 'spec-card' }, [
      el('div', { class: 'spec-card__eyebrow' }, ['Ficha técnica']),
      el('div', { class: 'spec-card__title' }, [m.label || 'Componente']),
      el('div', { class: 'spec-list' }, rows)
    ]);
  }

  function buildSimSection(sim, heading) {
    if (!sim || !window.TelemetrySims || !window.TelemetrySims[sim.type]) return null;
    var body = el('div', { class: 'sim__mount' }, []);
    var headChildren = [el('h3', {}, [sim.title || 'Laboratorio interactivo'])];
    if (sim.caption) headChildren.push(el('p', {}, [sim.caption]));
    var section = el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('h2', { class: 'reveal' }, [heading || 'Laboratorio interactivo']),
        el('div', { class: 'sim reveal' }, [
          el('div', { class: 'sim__head' }, headChildren),
          body
        ])
      ])
    ]);
    setTimeout(function () { window.TelemetrySims[sim.type](body); }, 0);
    return section;
  }

  function renderConceptBlock(b) {
    var kids = [];
    if (b.heading) kids.push(el('h2', { class: 'reveal' }, [b.heading]));
    var inner = [];
    (b.body || []).forEach(function (para) { inner.push(el('p', { html: para })); });
    if (b.code) inner.push(el('pre', { class: 'formula' }, [b.code]));
    if (b.diagram) {
      inner.push(el('figure', { class: 'diagram' + (b.diagram.wide ? ' diagram--wide' : '') }, [
        el('img', { src: b.diagram.src, alt: b.diagram.alt, loading: 'lazy' }),
        b.diagram.caption ? el('figcaption', { class: 'table-caption' }, [b.diagram.caption]) : null
      ]));
    }
    if (b.teacher) {
      inner.push(el('details', { class: 'teacher-note' }, [
        el('summary', {}, ['▸ Para quien imparte']),
        el('p', { html: b.teacher })
      ]));
    }
    kids.push(el('div', { class: 'concept reveal' }, inner));
    return el('section', { class: 'session-section' }, [el('div', { class: 'container' }, kids)]);
  }

  function renderCalloutBlock(b) {
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('div', { class: 'callout reveal' }, [
          b.heading ? el('h2', {}, [b.heading]) : null,
          el('p', { html: b.body })
        ])
      ])
    ]);
  }

  function renderDiagramBlock(b) {
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [
        el('figure', { class: 'diagram diagram--wide reveal' }, [
          el('img', { src: b.src, alt: b.alt, loading: 'lazy' }),
          b.caption ? el('figcaption', { class: 'table-caption' }, [b.caption]) : null
        ])
      ])
    ]);
  }

  function renderActivityBlock(b) {
    var kids = [];
    var head = [el('h2', {}, [b.heading || 'Actividad de diseño'])];
    if (b.time) head.push(el('span', { class: 'activity__time' }, [b.time]));
    kids.push(el('div', { class: 'activity__head' }, head));
    if (b.prompt) kids.push(el('p', { class: 'activity__prompt', html: b.prompt }));
    if (b.steps && b.steps.length) {
      kids.push(el('ol', { class: 'activity__steps' }, b.steps.map(function (s) { return el('li', { html: s }, []); })));
    }
    if (b.output) {
      kids.push(el('div', { class: 'activity__output' }, [
        el('span', { class: 'activity__output-label' }, ['Al final debe existir']),
        el('span', { html: b.output })
      ]));
    }
    if (b.hint) {
      kids.push(el('details', { class: 'activity__hint' }, [
        el('summary', {}, ['▸ Pista']),
        el('p', { html: b.hint })
      ]));
    }
    return el('section', { class: 'session-section' }, [
      el('div', { class: 'container' }, [el('div', { class: 'activity reveal' }, kids)])
    ]);
  }

  function renderLesson(data, sink) {
    return data.lesson.map(function (b, i) {
      var node;
      if (b.type === 'lab') node = buildSimSection(data.simulator, b.heading);
      else if (b.type === 'callout') node = renderCalloutBlock(b);
      else if (b.type === 'diagram') node = renderDiagramBlock(b);
      else if (b.type === 'activity') node = renderActivityBlock(b);
      else node = renderConceptBlock(b);
      if (node && b.heading && b.type !== 'callout' && b.type !== 'diagram') {
        node.id = 'sec-' + i;
        var short = b.heading.split(':')[0].split(' (')[0];
        sink.push({ id: 'sec-' + i, label: short });
      }
      return node;
    });
  }

  function buildScrollSpy(sections) {
    if (!sections.length) return null;
    var links = [];
    var ul = el('ul', { class: 'spy' }, sections.map(function (s) {
      var a = el('a', { href: '#' + s.id, 'data-spy': s.id }, [s.label]);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(s.id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      links.push(a);
      return el('li', {}, [a]);
    }));
    var progressFill = el('span', { class: 'rail-progress__fill' }, []);
    var progress = el('div', { class: 'rail-progress' }, [
      el('div', { class: 'rail-progress__label' }, ['Avance']),
      el('div', { class: 'rail-progress__track' }, [progressFill])
    ]);
    var nav = el('nav', { class: 'side-rail side-rail--left', 'aria-label': 'Índice de la sesión' }, [
      el('div', { class: 'side-rail__label' }, ['En esta sesión']),
      ul,
      progress
    ]);
    function updProgress() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (window.pageYOffset || h.scrollTop) / max * 100 : 0;
      progressFill.style.width = Math.max(0, Math.min(100, pct)).toFixed(1) + '%';
    }
    window.addEventListener('scroll', updProgress, { passive: true });
    setTimeout(updProgress, 0);
    setTimeout(function () {
      if (!('IntersectionObserver' in window)) return;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-spy') === en.target.id); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { var t = document.getElementById(s.id); if (t) obs.observe(t); });
    }, 0);
    return nav;
  }

  var DEFAULT_TELEMETRY = {
    label: 'Telemetría · demo',
    metrics: [
      { k: 'RPM', min: 1800, max: 5200, val: 3200, dec: 0, bar: true, hot: 4600 },
      { k: 'MOTOR °C', min: 78, max: 116, val: 92, dec: 0, bar: true, hot: 110, suffix: '°' },
      { k: 'CVT °C', min: 70, max: 108, val: 86, dec: 0, bar: true, hot: 105, suffix: '°' },
      { k: 'FUERZA G', min: 0, max: 2.4, val: 0.8, dec: 1, bar: true, hot: 1.8 },
      { k: 'VEL km/h', min: 0, max: 68, val: 34, dec: 0, bar: true },
      { k: 'BAT V', min: 12.1, max: 14.2, val: 13.4, dec: 1 }
    ],
    charts: [
      { title: 'Velocidad · km/h', min: 0, max: 68, val: 34, dec: 0 },
      { title: 'Motor · °C', min: 78, max: 116, val: 92, dec: 0, hot: 110, suffix: '°' },
      { title: 'Fuerza G', min: 0, max: 2.4, val: 0.8, dec: 1, hot: 1.8 }
    ]
  };

  function isHot(m) {
    return (m.hot != null && m.val >= m.hot) || (m.hotBelow != null && m.val <= m.hotBelow);
  }

  function cssVar(name, fb) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    v = (v || '').trim();
    return v || fb;
  }

  function withAlpha(hex, a) {
    hex = (hex || '').trim();
    if (hex.charAt(0) !== '#' || hex.length < 7) return hex;
    var n = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16);
    if (n.length < 2) n = '0' + n;
    return hex.slice(0, 7) + n;
  }

  function buildTelemetry() {
    var conf = window.COURSE_TELEMETRY || DEFAULT_TELEMETRY;
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('telemetryState') || 'null'); } catch (e) {}

    var accent = cssVar('--accent', cssVar('--blue-royal', '#2547E0'));
    var accent2 = cssVar('--accent-2', cssVar('--blue-bright', '#6C8CFF'));
    var signal = cssVar('--signal', cssVar('--signal-amber', '#FFB13D'));
    var grid = cssVar('--border', '#24304A');

    var metrics = conf.metrics.map(function (m) { var c = {}; for (var k in m) c[k] = m[k]; return c; });
    var charts = (conf.charts || []).map(function (m) { var c = {}; for (var k in m) c[k] = m[k]; return c; });
    if (saved && saved.metrics) metrics.forEach(function (m) { if (typeof saved.metrics[m.k] === 'number') m.val = saved.metrics[m.k]; });
    if (saved && saved.charts) charts.forEach(function (c) { if (typeof saved.charts[c.title] === 'number') c.val = saved.charts[c.title]; });

    var rows = metrics.map(function (m) {
      m.vEl = el('span', { class: 'telem__v' }, ['—']);
      var kids = [el('span', { class: 'telem__k' }, [m.k]), m.vEl];
      var row = [el('div', { class: 'telem__row' }, kids)];
      if (m.bar) { m.barEl = el('span', {}, []); row.push(el('div', { class: 'telem__bar' }, [m.barEl])); }
      return el('div', {}, row);
    });
    var latEl = el('span', { class: 'telem__v' }, ['—']);
    var lonEl = el('span', { class: 'telem__v' }, ['—']);
    rows.push(el('div', { class: 'telem__row telem__row--aux' }, [el('span', { class: 'telem__k' }, ['LAT']), latEl]));
    rows.push(el('div', { class: 'telem__row telem__row--aux' }, [el('span', { class: 'telem__k' }, ['LON']), lonEl]));

    var SPN = 48;
    var svgNS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs) {
      var n = document.createElementNS(svgNS, tag);
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
      return n;
    }
    function fmtVal(m, v) { return v.toFixed(m.dec) + (m.suffix || ''); }

    function buildMiniChart(metric, savedHist) {
      var svg = svgEl('svg', { viewBox: '0 0 100 40', preserveAspectRatio: 'none' });
      svg.appendChild(svgEl('line', { x1: 0, y1: 13.3, x2: 100, y2: 13.3, stroke: grid, 'stroke-width': 0.5, 'vector-effect': 'non-scaling-stroke' }));
      svg.appendChild(svgEl('line', { x1: 0, y1: 26.6, x2: 100, y2: 26.6, stroke: grid, 'stroke-width': 0.5, 'vector-effect': 'non-scaling-stroke' }));
      var area = svgEl('polygon', { fill: withAlpha(accent, 0.16), stroke: 'none' });
      var line = svgEl('polyline', { fill: 'none', stroke: accent2, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' });
      svg.appendChild(area); svg.appendChild(line);
      var hist = [];
      function norm(v) { return (v - metric.min) / (metric.max - metric.min); }
      function redraw() {
        var lp = hist.map(function (v, i) { return (i / (SPN - 1) * 100).toFixed(1) + ',' + (39 - v * 37).toFixed(1); });
        line.setAttribute('points', lp.join(' '));
        var lastX = ((hist.length - 1) / (SPN - 1) * 100).toFixed(1);
        area.setAttribute('points', '0,40 ' + lp.join(' ') + ' ' + lastX + ',40');
        var hot = isHot(metric);
        line.setAttribute('stroke', hot ? signal : accent2);
        area.setAttribute('fill', hot ? withAlpha(signal, 0.2) : withAlpha(accent, 0.16));
      }
      function update() { hist.push(norm(metric.val)); if (hist.length > SPN) hist.shift(); redraw(); }
      if (savedHist && savedHist.length) hist = savedHist.slice(-SPN);
      else for (var s = 0; s < SPN; s++) hist.push(0.3 + Math.random() * 0.4);
      redraw();
      var elChart = el('div', { class: 'mini-chart' }, [
        el('div', { class: 'telem-spark__label' }, [metric.title]),
        el('div', { class: 'spark' }, [
          el('div', { class: 'spark__area' }, [
            el('div', { class: 'spark__yaxis' }, [
              el('span', {}, [fmtVal(metric, metric.max)]),
              el('span', {}, [fmtVal(metric, (metric.min + metric.max) / 2)]),
              el('span', {}, [fmtVal(metric, metric.min)])
            ]),
            el('div', { class: 'spark__plot' }, [svg])
          ]),
          el('div', { class: 'spark__xaxis' }, [el('span', {}, ['−45 s']), el('span', {}, ['ahora'])])
        ])
      ]);
      return { el: elChart, update: update, key: metric.title, getHist: function () { return hist; } };
    }

    var savedHist = (saved && saved.hist) || {};
    var chartObjs = charts.map(function (c) { return buildMiniChart(c, savedHist[c.title]); });

    var aside = el('aside', { class: 'side-rail side-rail--right', 'aria-hidden': 'true' }, [
      el('div', { class: 'side-rail__label' }, [conf.label || 'Telemetría · demo']),
      el('div', { class: 'telem' }, rows),
      el('div', { class: 'telem-charts' }, chartObjs.map(function (c) { return c.el; }))
    ]);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var lat = saved && typeof saved.lat === 'number' ? saved.lat : 19.4326;
    var lon = saved && typeof saved.lon === 'number' ? saved.lon : -99.1332;

    function walk(m) {
      var span = (m.max - m.min);
      m.val += (Math.random() - 0.5) * span * 0.18;
      if (m.val < m.min) m.val = m.min;
      if (m.val > m.max) m.val = m.max;
    }
    function step() {
      metrics.forEach(function (m) {
        walk(m);
        m.vEl.textContent = m.val.toFixed(m.dec) + (m.suffix || '');
        var hot = isHot(m);
        m.vEl.classList.toggle('is-hot', !!hot);
        if (m.barEl) {
          m.barEl.style.width = ((m.val - m.min) / (m.max - m.min) * 100).toFixed(0) + '%';
          m.barEl.style.background = hot ? signal : accent;
        }
      });
      charts.forEach(function (c) { walk(c); });
      lat += (Math.random() - 0.5) * 0.0009;
      lon += (Math.random() - 0.5) * 0.0009;
      latEl.textContent = lat.toFixed(4);
      lonEl.textContent = lon.toFixed(4);
      chartObjs.forEach(function (c) { c.update(); });
      try {
        var state = { metrics: {}, charts: {}, lat: lat, lon: lon, hist: {} };
        metrics.forEach(function (m) { state.metrics[m.k] = m.val; });
        charts.forEach(function (c) { state.charts[c.title] = c.val; });
        chartObjs.forEach(function (c) { state.hist[c.key] = c.getHist(); });
        sessionStorage.setItem('telemetryState', JSON.stringify(state));
      } catch (e) {}
    }
    step();
    if (!reduced) setInterval(step, 900);
    return aside;
  }

  function renderSideRails(sections) {
    var rails = [];
    var spy = buildScrollSpy(sections);
    if (spy) rails.push(spy);
    rails.push(buildTelemetry());
    return rails;
  }

  function render(data) {
    var root = document.getElementById('session-root');
    root.appendChild(renderHeader(data));
    root.appendChild(renderHero(data));
    var modelNode = renderModel(data);
    if (modelNode) {
      var heroContainer = root.querySelector('.session-hero .container');
      if (heroContainer) heroContainer.appendChild(modelNode);
    }
    var sections = [];
    if (data.lesson && data.lesson.length) {
      renderLesson(data, sections).forEach(function (node) { if (node) root.appendChild(node); });
    }
    var dt = renderDecisionTable(data); if (dt) root.appendChild(dt);
    var ref = renderReference(data); if (ref) root.appendChild(ref);
    if (data.errors && data.errors.length) root.appendChild(renderErrors(data));
    if (data.deliverable) {
      var del = renderDeliverable(data); if (del) root.appendChild(del);
    } else if (data.safety) {
      var safe = renderSafety(data); if (safe) root.appendChild(safe);
    }
    if (data.rubric && data.rubric.length) {
      var rub = renderRubric(data); if (rub) root.appendChild(rub);
    }
    var bib = renderBiblio(data); if (bib) root.appendChild(bib);
    var cta = renderCta(data); if (cta) root.appendChild(cta);
    root.appendChild(renderNav(data));
    root.appendChild(renderFooter());
    if (sections.length) renderSideRails(sections).forEach(function (r) { if (r) root.appendChild(r); });
    document.title = data.title + ' · Curso Telemetría · MadRams';
    if (window.TelemetryAnim) window.TelemetryAnim.init();
  }

  window.TelemetryTemplate = { render: render };
})();
