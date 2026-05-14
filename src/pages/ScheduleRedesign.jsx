import { useMemo } from 'react'
import tokensCss from '../styles/tokens.css?raw'
import baseCss from '../styles/base.css?raw'
import componentsCss from '../styles/components.css?raw'
import { buildRedesignScheduleSnippets } from '../utils/redesignScheduleFromData'

const cleanBaseCss = baseCss.replace(/@import[^;]+;\n/g, '')

function buildSchedulePreviewHtml(referenceDate) {
  const s = buildRedesignScheduleSnippets(referenceDate)
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/400.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/500.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif/400.css" />
    <style>
      ${tokensCss}
      ${cleanBaseCss}
      ${componentsCss}

      body {
        background: #d9ceb9;
      }

      .schedule-shell {
        --pn-text-h1: 78px;
        --pn-text-h2: 54px;
        --pn-text-h3: 34px;
        --pn-text-h4: 26px;
        --pn-text-lg: 21px;
        --pn-text-base: 17px;
        --pn-text-sm: 15px;
        --pn-text-xs: 13px;
        --pn-text-eyebrow: 12px;
        max-width: 1440px;
        min-height: 100vh;
        margin: 0 auto;
        background: var(--pn-color-bg-base);
        border-left: var(--pn-border-soft);
        border-right: var(--pn-border-soft);
      }

      .schedule-nav {
        height: 74px;
        padding: 0 52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: var(--pn-border-soft);
      }

      .schedule-nav__links {
        display: flex;
        align-items: center;
        gap: 34px;
      }

      .schedule-nav__link {
        font-size: 12px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text);
      }

      .schedule-menu {
        display: none;
        flex-direction: column;
        gap: 4px;
      }

      .schedule-menu span {
        width: 19px;
        height: 1px;
        background: var(--pn-color-text);
      }

      .schedule-hero {
        padding: 92px 76px 72px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
        gap: 88px;
        align-items: end;
        border-bottom: var(--pn-border-soft);
      }

      .schedule-title {
        font-size: clamp(68px, 7vw, 108px);
        line-height: 0.96;
        letter-spacing: -0.055em;
        color: var(--pn-color-text);
      }

      .schedule-copy {
        max-width: 470px;
        margin-top: 24px;
      }

      .schedule-week {
        border-left: var(--pn-border-soft);
        padding-left: 56px;
      }

      .schedule-week__range {
        margin: 18px 0 26px;
        font-size: 34px;
        line-height: 1.1;
        color: var(--pn-color-text);
      }

      .schedule-week__controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .schedule-icon-btn,
      .schedule-view-btn,
      .schedule-filter {
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-elevated);
        color: var(--pn-color-text);
        font-size: 12px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        font-weight: var(--pn-weight-medium);
      }

      .schedule-icon-btn {
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .schedule-view-btn,
      .schedule-filter {
        padding: 12px 18px;
      }

      .schedule-filter--active,
      .schedule-view-btn--active {
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
        border-color: var(--pn-color-bg-dark);
      }

      .schedule-toolbar {
        padding: 30px 76px;
        display: flex;
        justify-content: space-between;
        gap: 26px;
        align-items: center;
        background: var(--pn-color-bg-secondary);
        border-bottom: var(--pn-border-soft);
      }

      .schedule-filters,
      .schedule-view {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .schedule-toolbar__label {
        margin-right: 12px;
        font-size: 11px;
        letter-spacing: var(--pn-tracking-widest);
        text-transform: uppercase;
        color: var(--pn-color-text-subtle);
      }

      .schedule-board-wrap {
        padding: 54px 76px 72px;
      }

      .schedule-board {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        border-top: var(--pn-border-thin);
        border-left: var(--pn-border-thin);
      }

      .schedule-day {
        min-height: 470px;
        border-right: var(--pn-border-thin);
        border-bottom: var(--pn-border-thin);
        background: rgba(251, 246, 236, 0.34);
      }

      .schedule-day__head {
        min-height: 98px;
        padding: 22px 18px;
        border-bottom: var(--pn-border-soft);
      }

      .schedule-day--active .schedule-day__head {
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
      }

      .schedule-day__name {
        font-size: 13px;
        color: var(--pn-color-text-subtle);
        margin-bottom: 6px;
      }

      .schedule-day--active .schedule-day__name {
        color: var(--pn-color-on-dark-muted);
      }

      .schedule-day__num {
        font-size: 38px;
        line-height: 1;
        color: var(--pn-color-text);
      }

      .schedule-day--active .schedule-day__num {
        color: var(--pn-color-on-dark);
      }

      .schedule-class {
        padding: 20px 18px;
        border-bottom: 0.5px solid rgba(122, 107, 84, 0.24);
      }

      .schedule-class__time {
        display: block;
        margin-bottom: 9px;
        font-size: 18px;
        color: var(--pn-color-text);
      }

      .schedule-class__name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        color: var(--pn-color-text);
        font-weight: var(--pn-weight-medium);
      }

      .schedule-class__coach {
        margin-top: 6px;
        font-size: 12px;
        color: var(--pn-color-text-muted);
      }

      .schedule-class__bottom {
        margin-top: 13px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .schedule-class__duration,
      .schedule-class__spots {
        font-size: 10px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
      }

      .schedule-class__duration {
        color: var(--pn-color-text-muted);
      }

      .schedule-class__spots {
        color: var(--pn-color-primary);
      }

      .schedule-legend {
        padding-top: 34px;
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: center;
        border-bottom: var(--pn-border-soft);
        padding-bottom: 34px;
      }

      .schedule-legend__items {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
      }

      .schedule-legend__item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text-muted);
      }

      .schedule-mobile-days,
      .schedule-mobile-list,
      .schedule-mobile-cta {
        display: none;
      }

      .schedule-footer {
        padding: 58px 76px 34px;
        background: var(--pn-color-bg-secondary);
      }

      .schedule-footer__grid {
        display: grid;
        grid-template-columns: 1.4fr repeat(2, minmax(0, 1fr));
        gap: 52px;
        padding-bottom: 48px;
        border-bottom: var(--pn-border-soft);
      }

      .schedule-footer__bottom {
        padding-top: 22px;
        display: flex;
        justify-content: space-between;
        gap: 22px;
        font-size: 12px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text-muted);
      }

      @media (max-width: 900px) {
        .schedule-shell {
          --pn-text-h1: 42px;
          --pn-text-h2: 36px;
          --pn-text-h3: 30px;
          --pn-text-h4: 27px;
          --pn-text-lg: 19px;
          --pn-text-base: 16px;
          --pn-text-sm: 15px;
          --pn-text-xs: 13px;
          --pn-text-eyebrow: 11px;
          border: none;
        }

        .schedule-nav {
          height: 62px;
          padding: 0 20px;
        }

        .schedule-nav__links {
          display: none;
        }

        .schedule-menu {
          display: flex;
        }

        .schedule-hero {
          display: block;
          padding: 54px 24px 34px;
        }

        .schedule-title {
          font-size: 46px;
          line-height: 1.02;
        }

        .schedule-copy {
          margin-top: 18px;
        }

        .schedule-week {
          margin-top: 30px;
          padding: 24px 0 0;
          border-left: none;
          border-top: var(--pn-border-soft);
        }

        .schedule-week__range {
          margin: 10px 0 18px;
          font-size: 22px;
        }

        .schedule-toolbar {
          display: block;
          padding: 18px 24px;
        }

        .schedule-filters {
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 2px;
          scrollbar-width: none;
        }

        .schedule-filters::-webkit-scrollbar {
          display: none;
        }

        .schedule-toolbar__label,
        .schedule-view,
        .schedule-board,
        .schedule-legend {
          display: none;
        }

        .schedule-board-wrap {
          padding: 0;
        }

        .schedule-mobile-days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 8px;
          padding: 14px 24px;
          border-bottom: var(--pn-border-soft);
          background: var(--pn-color-bg-base);
          overflow-x: auto;
        }

        .schedule-mobile-day {
          min-width: 52px;
          padding: 12px 8px;
          border: var(--pn-border-thin);
          background: var(--pn-color-bg-elevated);
          text-align: center;
        }

        .schedule-mobile-day--active {
          background: var(--pn-color-bg-dark);
          color: var(--pn-color-on-dark);
          border-color: var(--pn-color-bg-dark);
        }

        .schedule-mobile-day span {
          display: block;
          font-size: 10px;
          letter-spacing: var(--pn-tracking-wider);
          text-transform: uppercase;
          color: var(--pn-color-text-subtle);
        }

        .schedule-mobile-day--active span {
          color: var(--pn-color-on-dark-muted);
        }

        .schedule-mobile-day strong {
          display: block;
          margin-top: 4px;
          font-size: 22px;
          line-height: 1;
        }

        .schedule-mobile-list {
          display: block;
          padding: 28px 24px 34px;
        }

        .schedule-mobile-list__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 20px;
          margin-bottom: 18px;
        }

        .schedule-mobile-class {
          display: grid;
          grid-template-columns: 74px 1fr auto;
          gap: 16px;
          padding: 22px 0;
          border-bottom: 0.5px solid rgba(122, 107, 84, 0.26);
        }

        .schedule-mobile-class--muted {
          opacity: 0.48;
        }

        .schedule-mobile-class__time {
          font-size: 24px;
          color: var(--pn-color-text);
          line-height: 1;
        }

        .schedule-mobile-class__duration {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          color: var(--pn-color-text-muted);
        }

        .schedule-mobile-class__name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 17px;
          color: var(--pn-color-text);
          font-weight: var(--pn-weight-medium);
        }

        .schedule-mobile-class__coach,
        .schedule-mobile-class__spots {
          margin-top: 6px;
          font-size: 12px;
          letter-spacing: var(--pn-tracking-wide);
          color: var(--pn-color-text-muted);
        }

        .schedule-mobile-class__spots {
          color: var(--pn-color-primary);
          text-transform: uppercase;
          letter-spacing: var(--pn-tracking-wider);
        }

        .schedule-mobile-class__arrow {
          width: 34px;
          height: 34px;
          border: var(--pn-border-thin);
          background: var(--pn-color-bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: center;
        }

        .schedule-mobile-cta {
          display: block;
          padding: 46px 24px;
          text-align: center;
          background: var(--pn-color-bg-dark);
          color: var(--pn-color-on-dark);
        }

        .schedule-footer {
          padding: 38px 24px 26px;
        }

        .schedule-footer__grid {
          grid-template-columns: 1fr;
          gap: 28px;
          padding-bottom: 30px;
        }

        .schedule-footer__bottom {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="schedule-shell">
      <nav class="schedule-nav">
        <div class="pn-nav__logo">
          <span class="pn-serif pn-nav__logo-e">e</span>
          <span class="pn-nav__logo-name">studio popnest</span>
        </div>
        <div class="schedule-nav__links">
          <a class="schedule-nav__link" href="#">Practicas</a>
          <a class="schedule-nav__link" href="#">Horario</a>
          <a class="schedule-nav__link" href="#">Maestras</a>
          <a class="schedule-nav__link" href="#">Contacto</a>
          <button class="pn-btn pn-btn--primary pn-btn--sm">Reservar</button>
        </div>
        <button class="schedule-menu" aria-label="Menu">
          <span></span>
          <span></span>
        </button>
      </nav>

      <main>
        <section class="schedule-hero">
          <div>
            <div class="pn-eyebrow pn-divider-editorial" style="margin-bottom: 24px;">Programa semanal</div>
            <h1 class="schedule-title">
              Encuentra tu<br />
              <span class="pn-serif" style="color: var(--pn-color-primary);">ritmo.</span>
            </h1>
            <p class="pn-text schedule-copy">
              Una semana completa de practicas, con maestras presentes y grupos pequenos.
              Filtra por disciplina y reserva con un clic.
            </p>
          </div>

          <aside class="schedule-week">
            <div class="pn-eyebrow">Semana en curso</div>
            <p class="schedule-week__range">${s.scheduleWeekRange}</p>
            <div class="schedule-week__controls">
              <button class="schedule-icon-btn">←</button>
              <button class="schedule-view-btn">Esta semana</button>
              <button class="schedule-icon-btn">→</button>
            </div>
          </aside>
        </section>

        <section class="schedule-toolbar">
          <div class="schedule-filters">
            <span class="schedule-toolbar__label">Practica</span>
            <button class="schedule-filter schedule-filter--active">Todas</button>
            <button class="schedule-filter"><span class="pn-dot pn-dot--yoga"></span> Yoga</button>
            <button class="schedule-filter"><span class="pn-dot pn-dot--pilates"></span> Pilates</button>
            <button class="schedule-filter"><span class="pn-dot pn-dot--meditation"></span> Meditacion</button>
            <button class="schedule-filter"><span class="pn-dot pn-dot--sound"></span> Sound</button>
            <button class="schedule-filter"><span class="pn-dot pn-dot--taichi"></span> Tai Chi</button>
          </div>
          <div class="schedule-view">
            <span class="schedule-toolbar__label">Vista</span>
            <button class="schedule-view-btn schedule-view-btn--active">Semana</button>
            <button class="schedule-view-btn">Lista</button>
          </div>
        </section>

        <section class="schedule-mobile-days">
            ${s.scheduleMobileDays}
        </section>

        <section class="schedule-board-wrap">
          <div class="schedule-board">
            ${s.scheduleBoard}
          </div>

          <div class="schedule-mobile-list">
            ${s.scheduleMobileList}
          </div>

          <div class="schedule-legend">
            <div class="schedule-legend__items">
              <span class="schedule-legend__item"><span class="pn-dot pn-dot--yoga"></span>Yoga</span>
              <span class="schedule-legend__item"><span class="pn-dot pn-dot--pilates"></span>Pilates</span>
              <span class="schedule-legend__item"><span class="pn-dot pn-dot--meditation"></span>Meditacion</span>
              <span class="schedule-legend__item"><span class="pn-dot pn-dot--sound"></span>Sound Healing</span>
              <span class="schedule-legend__item"><span class="pn-dot pn-dot--taichi"></span>Tai Chi</span>
            </div>
            <p class="pn-text-xs">Cupos limitados. Reserva con anticipacion.</p>
          </div>
        </section>

        <section class="schedule-mobile-cta">
          <div class="pn-eyebrow pn-eyebrow--on-dark" style="margin-bottom: 12px;">Paquetes</div>
          <h2 class="pn-h4" style="color: var(--pn-color-on-dark);">Mas clases, mejor tarifa.</h2>
          <p class="pn-text-sm" style="color: var(--pn-color-on-dark-muted); margin: 12px auto 22px; max-width: 280px;">Paquetes de 5, 10 o ilimitado al mes.</p>
          <button class="pn-btn pn-btn--ghost-light">Ver paquetes</button>
        </section>
      </main>

      <footer class="schedule-footer">
        <div class="schedule-footer__grid">
          <div>
            <div class="pn-nav__logo" style="margin-bottom: 18px;">
              <span class="pn-serif pn-nav__logo-e">e</span>
              <span class="pn-nav__logo-name">studio popnest</span>
            </div>
            <p class="pn-text-sm">Un espacio pequeno para una practica honesta.</p>
          </div>
          <div>
            <div class="pn-footer__col-title">Visitanos</div>
            <p class="pn-text-sm">Londres 105<br />Del Carmen, Coyoacan<br />CDMX, 04100</p>
          </div>
          <div>
            <div class="pn-footer__col-title">Estudio</div>
            <a class="pn-footer__link">Practicas</a>
            <a class="pn-footer__link">Horario</a>
            <a class="pn-footer__link">Maestras</a>
            <a class="pn-footer__link">Paquetes</a>
          </div>
        </div>
        <div class="schedule-footer__bottom">
          <span>2026 Estudio Popnest - Hecho en Coyoacan</span>
          <span>Instagram &nbsp;&nbsp; Whatsapp</span>
        </div>
      </footer>
    </div>
  </body>
</html>`
}

function ScheduleRedesign() {
  const previewHtml = useMemo(() => buildSchedulePreviewHtml(new Date()), [])
  return (
    <iframe
      title="Schedule redesign preview"
      srcDoc={previewHtml}
      className="block h-screen w-full border-0"
    />
  )
}

export default ScheduleRedesign
