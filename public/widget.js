;(function () {
  'use strict'

  function decodeEvent(raw) {
    if (!raw) return null
    try {
      var b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
      var pad = b64.length % 4
      if (pad) b64 += '='.repeat(4 - pad)
      var json = decodeURIComponent(escape(atob(b64)))
      var parsed = JSON.parse(json)
      if (!parsed || typeof parsed !== 'object') return null
      if (typeof parsed.t !== 'string' || typeof parsed.title !== 'string') return null
      if (Number.isNaN(Date.parse(parsed.t))) return null
      var result = { t: parsed.t, title: parsed.title.trim() }
      if (typeof parsed.url === 'string' && parsed.url.trim()) {
        result.url = parsed.url.trim()
      }
      return result
    } catch (e) {
      return null
    }
  }

  function getLocalTz() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch (e) {
      return 'UTC'
    }
  }

  function formatTzLabel(ms) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: getLocalTz(),
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(ms))
    } catch (e) {
      return new Date(ms).toUTCString()
    }
  }

  function computeState(targetMs, nowMs) {
    var diff = Math.floor((targetMs - nowMs) / 1000)
    var isPast = diff <= 0
    diff = Math.max(diff, 0)
    return {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
      isPast: isPast,
    }
  }

  var STYLES = `
    :host {
      display: block;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      background: #020617;
      color: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .title {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .label {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .units {
      display: flex;
      justify-content: center;
      gap: 8px;
    }
    .unit {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      border-radius: 8px;
      background: #1e293b;
      padding: 4px 8px;
      min-width: 2.5rem;
      font-size: 1rem;
    }
    .value.active { color: #34d399; }
    .value.past { color: #64748b; }
    .unit-label {
      font-size: 0.625rem;
      color: #64748b;
      margin-top: 4px;
    }
    .ended {
      margin-top: 12px;
      color: #94a3b8;
      font-size: 0.75rem;
    }
    .error {
      color: #64748b;
      font-size: 0.75rem;
    }
    .link {
      display: inline-block;
      margin-top: 16px;
      padding: 6px 16px;
      border-radius: 8px;
      background: #059669;
      color: #ffffff;
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      transition: background 0.15s;
    }
    .link:hover {
      background: #10b981;
    }
  `

  var UNIT_LABELS = ['Days', 'Hours', 'Minutes', 'Seconds']

  class CountdownWidget extends HTMLElement {
    constructor() {
      super()
      this._timer = null
      this._event = null
      this._shadow = this.attachShadow({ mode: 'open' })
      this._renderShell()
    }

    static get observedAttributes() {
      return ['d']
    }

    attributeChangedCallback() {
      this._event = decodeEvent(this.getAttribute('d'))
      this._update()
      this._startOrStop()
    }

    connectedCallback() {
      this._event = decodeEvent(this.getAttribute('d'))
      this._update()
      this._startOrStop()
    }

    disconnectedCallback() {
      this._stop()
    }

    _renderShell() {
      var style = document.createElement('style')
      style.textContent = STYLES
      this._container = document.createElement('div')
      this._shadow.appendChild(style)
      this._shadow.appendChild(this._container)
    }

    _update() {
      if (!this._event) {
        this._container.innerHTML = '<p class="error">Invalid event link</p>'
        return
      }

      var targetMs = Date.parse(this._event.t)
      var state = computeState(targetMs, Date.now())
      var valueClass = state.isPast ? 'past' : 'active'

      var values = [state.days, state.hours, state.minutes, state.seconds]
      var unitsHtml = values
        .map(function (v, i) {
          return (
            '<div class="unit">' +
            '<span class="value ' +
            valueClass +
            '">' +
            String(v).padStart(2, '0') +
            '</span>' +
            '<span class="unit-label">' +
            UNIT_LABELS[i] +
            '</span>' +
            '</div>'
          )
        })
        .join('')

      var html =
        '<div class="title">' +
        this._escape(this._event.title) +
        '</div>' +
        '<div class="label">' +
        this._escape(formatTzLabel(targetMs)) +
        '</div>' +
        '<div class="units">' +
        unitsHtml +
        '</div>'

      if (state.isPast) {
        html += '<div class="ended">Event has ended</div>'
      }

      if (this._event.url) {
        html +=
          '<a class="link" href="' +
          this._escape(this._event.url) +
          '" target="_blank" rel="noopener noreferrer">Watch stream</a>'
      }

      this._container.innerHTML = html
    }

    _startOrStop() {
      this._stop()
      if (this._event && !computeState(Date.parse(this._event.t), Date.now()).isPast) {
        var self = this
        this._timer = setInterval(function () {
          var state = computeState(Date.parse(self._event.t), Date.now())
          self._update()
          if (state.isPast) self._stop()
        }, 1000)
      }
    }

    _stop() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
    }

    _escape(s) {
      var d = document.createElement('div')
      d.textContent = s
      return d.innerHTML
    }
  }

  if (!customElements.get('countdown-widget')) {
    customElements.define('countdown-widget', CountdownWidget)
  }
})()
