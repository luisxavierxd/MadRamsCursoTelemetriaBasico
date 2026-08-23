(function () {
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  window.TelemetrySims['thermostat-sim'] = function (container) {
    var isHysteresis = true;
    var alarmActive = false;
    var lastState = false;
    var temp = 70.0;
    var noiseTimer = null;

    var range = h('input', { type: 'range', min: '60', max: '130', step: '0.5', value: '70' });
    var tReadout = h('span', { class: 'v' }, ['70.0 °C']);
    var adcReadout = h('span', { class: 'v' }, ['585 (ADC 12b)']);
    var alarmPill = h('span', { class: 'sim__pill sim__pill--ok' }, ['ALARMA A PITS: INACTIVA']);
    var statusPill = h('span', { class: 'sim__pill sim__pill--ok' }, ['ESTADO: NORMAL']);

    var modeCheck = h('input', { type: 'checkbox' });
    modeCheck.checked = true;

    var logBox = h('div', {
      style: 'background:var(--bg-panel-2);border:1px solid var(--border);border-radius:var(--radius);padding:10px;font-family:var(--font-mono);font-size:0.75rem;max-height:160px;overflow-y:auto;color:var(--text);margin-top:10px;line-height:1.4;'
    }, []);

    function appendLog(msg, color) {
      var line = h('div', { style: 'color:' + (color || 'var(--text-dim)') }, [msg]);
      logBox.appendChild(line);
      logBox.scrollTop = logBox.scrollHeight;
      while (logBox.childNodes.length > 20) {
        logBox.removeChild(logBox.firstChild);
      }
    }

    var explanation = h('div', {
      style: 'margin-top:8px;font-size:0.82rem;color:var(--text-dim);line-height:1.4;'
    }, ['Estado: Inicial']);

    var stage = h('div', { class: 'sim__stage' }, [
      h('div', { class: 'sim__readout' }, [
        h('div', {}, [h('span', { class: 'k' }, ['Temperatura medida: ']), tReadout]),
        h('div', {}, [h('span', { class: 'k' }, ['Lectura cruda: ']), adcReadout]),
        h('div', { style: 'margin-top:6px;' }, [alarmPill, ' ', statusPill]),
        explanation
      ]),
      h('div', { style: 'margin-top:12px;' }, [
        h('div', { style: 'font-size:0.75rem;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:4px;' }, ['MONITOR SERIAL / TELEMETRÍA (115200 baud):']),
        logBox
      ])
    ]);

    function evalState(currentT) {
      var adc = Math.round((currentT - 60.0) / 70.0 * 4095.0);
      tReadout.textContent = currentT.toFixed(1) + ' °C';
      adcReadout.textContent = adc + ' (ADC 12b)';

      if (isHysteresis) {
        // Con histéresis: Alarma ON en >= 95, OFF en <= 88
        if (!alarmActive && currentT >= 95.0) {
          alarmActive = true;
        } else if (alarmActive && currentT <= 88.0) {
          alarmActive = false;
        }
      } else {
        // Sin histéresis: umbral simple a 90°C
        alarmActive = currentT >= 90.0;
      }

      var isCritical = currentT >= 110.0;
      if (alarmActive) {
        alarmPill.textContent = '📡 ALERTA A PITS: TRANSMITIENDO ALERTA';
        alarmPill.className = 'sim__pill sim__pill--warn';
      } else {
        alarmPill.textContent = 'ALARMA A PITS: INACTIVA';
        alarmPill.className = 'sim__pill sim__pill--ok';
      }

      if (isCritical) {
        statusPill.textContent = '🔥 SOBRECALENTAMIENTO CRÍTICO (>110°C)';
        statusPill.className = 'sim__pill sim__pill--crit';
      } else {
        statusPill.textContent = 'ESTADO: NORMAL';
        statusPill.className = 'sim__pill sim__pill--ok';
      }

      if (isHysteresis) {
        if (currentT > 88.0 && currentT < 95.0) {
          explanation.innerHTML = '📍 <strong>En banda muerta (88–95 °C):</strong> El sistema mantiene su estado de alerta anterior: <em>' + (alarmActive ? 'ALERTA ACTIVA (venía de sobrecalentamiento)' : 'NORMAL (venía frío)') + '</em>, evitando saturar el radio con falsas alertas.';
        } else if (currentT >= 95.0) {
          explanation.innerHTML = '🔥 <strong>Sobre umbral de alerta (&ge; 95 °C):</strong> Alarma disparada a la pantalla de pits por sobrecalentamiento.';
        } else {
          explanation.innerHTML = '❄ <strong>Bajo umbral de recuperación (&le; 88 °C):</strong> Temperatura normalizada, la alerta a pits se apaga.';
        }
      } else {
        explanation.innerHTML = '⚠️ <strong>Sin histéresis (umbral único 90 °C):</strong> El ruido eléctrico hace que la alerta entre y salga continuamente, saturando el radio telemétrico (chattering).';
      }

      var logColor = alarmActive ? 'var(--blue-bright)' : 'var(--text-dim)';
      if (alarmActive !== lastState) {
        logColor = alarmActive ? 'var(--signal-amber)' : 'var(--blue-bright)';
        appendLog('>>> CAMBIO DE ESTADO: Alarma a Pits ' + (alarmActive ? '[DISPARADA]' : '[RESTABLECIDA]') + ' a ' + currentT.toFixed(1) + ' °C', logColor);
      }
      appendLog('T=' + currentT.toFixed(1) + ' C  alerta_pits=' + (alarmActive ? '1 (ALERTA)' : '0 (OK)'), logColor);
      lastState = alarmActive;

      if (isCritical && window.TelemetrySims._util) {
        window.TelemetrySims._util.alarm(stage);
      }
    }

    range.addEventListener('input', function () {
      temp = parseFloat(range.value);
      evalState(temp);
    });

    modeCheck.addEventListener('change', function () {
      isHysteresis = modeCheck.checked;
      if (noiseTimer) { clearInterval(noiseTimer); noiseTimer = null; }
      if (!isHysteresis) {
        // En modo sin histéresis, simular ruido térmico/eléctrico si está cerca de 90°C
        noiseTimer = setInterval(function () {
          if (!isHysteresis && Math.abs(temp - 90.0) <= 2.0) {
            var noise = (Math.random() - 0.5) * 1.6;
            evalState(temp + noise);
          }
        }, 300);
      }
      evalState(temp);
    });

    var controls = h('div', { class: 'sim__controls' }, [
      h('div', { class: 'sim__control' }, [
        h('label', {}, ['Potenciómetro de temperatura (simula sensor de motor/CVT):']),
        range
      ]),
      h('label', { style: 'display:flex;gap:8px;align-items:center;font-size:0.85rem;margin-top:6px;' }, [
        modeCheck,
        'Activar lógica con histéresis (95°C ALERTA / 88°C RECUPERACIÓN)'
      ]),
      h('div', { style: 'font-size:0.8rem;color:var(--text-dim);margin-top:4px;' }, [
        '💡 Desmarca la casilla para probar cómo el ruido eléctrico en un umbral simple a 90 °C satura el enlace telemétrico con falsas alarmas.'
      ])
    ]);

    container.appendChild(h('div', { class: 'sim__body sim__body--split' }, [controls, stage]));
    evalState(temp);
  };
})();
