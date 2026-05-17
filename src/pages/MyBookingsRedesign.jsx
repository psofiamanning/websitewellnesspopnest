import tokensCss from '../styles/tokens.css?raw'
import baseCss from '../styles/base.css?raw'
import componentsCss from '../styles/components.css?raw'
import logoUrl from '../assets/logo.svg?url'

const cleanBaseCss = baseCss.replace(/@import[^;]+;\n/g, '')

const previewHtml = `<!doctype html>
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
      body { background: #d9ceb9; }
      .mb-shell {
        --pn-text-h1: 52px;
        --pn-text-h2: 36px;
        --pn-text-h3: 28px;
        --pn-text-h4: 22px;
        --pn-text-lg: 18px;
        --pn-text-base: 16px;
        --pn-text-sm: 14px;
        --pn-text-xs: 13px;
        --pn-text-eyebrow: 11px;
        max-width: 1440px;
        margin: 0 auto;
        background: var(--pn-color-bg-base);
        border-left: var(--pn-border-soft);
        border-right: var(--pn-border-soft);
        min-height: 100vh;
      }
      .mb-nav {
        height: 72px;
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: var(--pn-border-soft);
      }
      .mb-nav__center {
        display: flex;
        gap: 28px;
        align-items: center;
      }
      .mb-nav__link {
        font-size: 11px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text);
      }
      .mb-user {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
      }
      .mb-user__avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: var(--pn-weight-medium);
      }
      .mb-menu { display: none; flex-direction: column; gap: 4px; }
      .mb-menu span { width: 18px; height: 1px; background: var(--pn-color-text); }

      .mb-head {
        padding: 48px 40px 32px;
        border-bottom: var(--pn-border-soft);
      }
      .mb-head__title {
        font-size: clamp(40px, 5vw, 56px);
        line-height: 1.05;
        letter-spacing: -0.04em;
      }
      .mb-stats {
        margin-top: 32px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(200px, 0.85fr);
        gap: 14px;
      }
      .mb-stat {
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-elevated);
        padding: 20px 18px;
      }
      .mb-stat__label {
        font-size: 10px;
        letter-spacing: var(--pn-tracking-widest);
        text-transform: uppercase;
        color: var(--pn-color-text-subtle);
        margin-bottom: 10px;
      }
      .mb-stat--highlight {
        background: var(--pn-color-bg-secondary);
        border-color: var(--pn-color-border);
      }
      .mb-stat--highlight .mb-stat__big { font-size: 28px; }

      .mb-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
        gap: 36px;
        padding: 40px;
        align-items: start;
      }
      .mb-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 20px;
        margin-bottom: 28px;
        border-bottom: var(--pn-border-soft);
        padding-bottom: 14px;
      }
      .mb-tab {
        font-size: 11px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text-muted);
        padding-bottom: 10px;
        margin-bottom: -15px;
        border-bottom: 2px solid transparent;
        cursor: default;
      }
      .mb-tab--active {
        color: var(--pn-color-text);
        border-bottom-color: var(--pn-color-primary);
      }

      .mb-section-label {
        font-size: 11px;
        letter-spacing: var(--pn-tracking-widest);
        text-transform: uppercase;
        color: var(--pn-color-text-subtle);
        margin-bottom: 16px;
      }

      .mb-class-card {
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-elevated);
        padding: 22px 20px;
        margin-bottom: 12px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 18px;
        align-items: center;
      }
      .mb-class-card__date { font-size: 13px; color: var(--pn-color-text-muted); }
      .mb-class-card__name { font-size: 17px; font-weight: var(--pn-weight-medium); display: flex; align-items: center; gap: 8px; }
      .mb-class-card__meta { font-size: 13px; color: var(--pn-color-text-soft); margin-top: 4px; }
      .mb-class-card__actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

      .mb-history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 0.5px solid rgba(122, 107, 84, 0.22);
        gap: 16px;
      }

      .mb-package {
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
        padding: 28px 24px;
        border: none;
        margin-bottom: 20px;
      }
      .mb-package__title { color: var(--pn-color-on-dark); margin-bottom: 6px; }
      .mb-package__bar {
        height: 4px;
        background: rgba(244, 237, 226, 0.2);
        margin: 18px 0 14px;
      }
      .mb-package__bar-fill {
        height: 100%;
        width: 70%;
        background: var(--pn-color-primary);
      }
      .mb-package .pn-btn--ghost-light { margin-top: 20px; width: 100%; }

      .mb-atajos {
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-elevated);
        padding: 22px 20px;
        margin-bottom: 20px;
      }
      .mb-atajos a {
        display: block;
        padding: 12px 0;
        border-bottom: 0.5px solid rgba(122, 107, 84, 0.2);
        font-size: 14px;
        color: var(--pn-color-text);
      }
      .mb-atajos a:last-child { border-bottom: none; }

      .mb-reco {
        background: var(--pn-color-bg-warm);
        border: var(--pn-border-thin);
        padding: 22px 20px;
      }

      .mb-footer {
        padding: 28px 40px 36px;
        border-top: var(--pn-border-soft);
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        font-size: 11px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text-muted);
      }

      .mb-mobile-only { display: none; }

      @media (max-width: 960px) {
        .mb-shell { border: none; }
        .mb-nav { padding: 0 20px; height: 60px; }
        .mb-nav__center { display: none; }
        .mb-menu { display: flex; }
        .mb-head { padding: 32px 20px 24px; }
        .mb-stats {
          grid-template-columns: 1fr 1fr;
        }
        .mb-stat:last-child { grid-column: 1 / -1; }
        .mb-layout {
          grid-template-columns: 1fr;
          padding: 24px 20px 40px;
        }
        .mb-sidebar { order: -1; }
        .mb-desktop-only { display: none; }
        .mb-mobile-only { display: block; }
        .mb-class-card {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .mb-class-card__actions { justify-content: flex-start; }
      }
    </style>
  </head>
  <body>
    <div class="mb-shell">
      <nav class="mb-nav">
        <div class="pn-nav__logo pn-nav__logo--official">
          <img src="${logoUrl}" alt="Estudio Popnest Wellness" style="height:42px;width:auto;display:block;max-width:200px;object-fit:contain;" />
        </div>
        <div class="mb-nav__center">
          <span class="mb-nav__link">Practicas</span>
          <span class="mb-nav__link">Horario</span>
          <span class="mb-nav__link">Maestras</span>
          <span class="mb-nav__link" style="color:var(--pn-color-primary);">Paquetes</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <div class="mb-user mb-desktop-only">
            <span class="mb-user__avatar">V</span>
            <span>Hola, Valeria</span>
          </div>
          <button type="button" class="mb-menu" aria-label="Menu"><span></span><span></span></button>
        </div>
      </nav>

      <header class="mb-head">
        <div class="pn-eyebrow" style="margin-bottom:14px;">Tu cuenta</div>
        <h1 class="mb-head__title">Mis <span class="pn-serif" style="color:var(--pn-color-primary);">reservas.</span></h1>
        <p class="pn-text-lg" style="margin-top:14px;max-width:560px;">
          Buenos dias, Valeria — tu proxima clase es en 6 horas.
        </p>
        <div class="mb-stats">
          <div class="mb-stat">
            <div class="mb-stat__label">Proxima clase</div>
            <div class="pn-text-sm"><strong>Lun 12</strong> · 07:00</div>
            <div class="pn-text-sm" style="margin-top:8px;">Vinyasa · Mariana</div>
          </div>
          <div class="mb-stat">
            <div class="mb-stat__label">Clases restantes</div>
            <div class="pn-text" style="font-size:22px;">7 de 10</div>
            <div class="pn-text-xs" style="margin-top:6px;color:var(--pn-color-text-muted);">Paquete vigente hasta 12 jun</div>
          </div>
          <div class="mb-stat">
            <div class="mb-stat__label">Maestra favorita</div>
            <div class="pn-text-sm"><strong>Mariana R.</strong></div>
            <div class="pn-text-xs" style="margin-top:6px;">8 clases contigo</div>
          </div>
          <div class="mb-stat">
            <div class="mb-stat__label">Practica preferida</div>
            <div class="pn-text-sm"><strong>Vinyasa Yoga</strong></div>
            <div class="pn-text-xs" style="margin-top:6px;">61% de tus clases</div>
          </div>
          <div class="mb-stat mb-stat--highlight">
            <div class="mb-stat__label">Este mes</div>
            <div class="mb-stat__big pn-serif" style="color:var(--pn-color-primary);">14</div>
            <div class="pn-text-sm">practicas</div>
            <div class="pn-text-xs" style="margin-top:8px;">4 mas que el mes pasado</div>
          </div>
        </div>
      </header>

      <div class="mb-layout">
        <div class="mb-main">
          <div class="mb-tabs">
            <span class="mb-tab mb-tab--active">Proximas (3)</span>
            <span class="mb-tab">Pasadas (14)</span>
            <span class="mb-tab">Canceladas (2)</span>
            <span class="mb-tab">Lista de espera (1)</span>
          </div>

          <div class="mb-section-label">I — Tu agenda</div>
          <article class="mb-class-card">
            <div>
              <div class="mb-class-card__date">12 may</div>
              <div style="font-size:20px;font-weight:500;">07:00</div>
            </div>
            <div>
              <div class="mb-class-card__name"><span class="pn-dot pn-dot--yoga"></span> Vinyasa Yoga</div>
              <div class="mb-class-card__meta">con Mariana Reyes · Salon principal · 60 min</div>
            </div>
            <div class="mb-class-card__actions">
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Detalles</button>
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Cancelar</button>
            </div>
          </article>
          <article class="mb-class-card">
            <div>
              <div class="mb-class-card__date">15 may</div>
              <div style="font-size:20px;font-weight:500;">10:00</div>
            </div>
            <div>
              <div class="mb-class-card__name"><span class="pn-dot pn-dot--pilates"></span> Pilates Mat</div>
              <div class="mb-class-card__meta">con Daniela Cruz · Studio reformer · 55 min</div>
            </div>
            <div class="mb-class-card__actions">
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Detalles</button>
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Cancelar</button>
            </div>
          </article>
          <article class="mb-class-card">
            <div>
              <div class="mb-class-card__date">16 may</div>
              <div style="font-size:20px;font-weight:500;">20:00</div>
            </div>
            <div>
              <div class="mb-class-card__name"><span class="pn-dot pn-dot--sound"></span> Sound Healing</div>
              <div class="mb-class-card__meta">con Ana Velez · Sesion especial · 75 min</div>
            </div>
            <div class="mb-class-card__actions">
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Detalles</button>
              <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Cancelar</button>
            </div>
          </article>

          <div class="mb-section-label" style="margin-top:36px;">II — Historial</div>
          <div class="mb-history-item">
            <div>
              <div class="pn-text-sm">10 may · 09:00</div>
              <div class="pn-text" style="font-weight:500;">Vinyasa Yoga</div>
            </div>
            <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Reservar igual</button>
          </div>
          <div class="mb-history-item">
            <div>
              <div class="pn-text-sm">08 may · 19:00</div>
              <div class="pn-text" style="font-weight:500;">Meditacion guiada</div>
            </div>
            <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Reservar igual</button>
          </div>
        </div>

        <aside class="mb-sidebar">
          <div class="mb-package">
            <div class="pn-eyebrow pn-eyebrow--on-dark" style="margin-bottom:8px;">Tu paquete</div>
            <h3 class="pn-h4 mb-package__title">Paquete 10 clases.</h3>
            <p class="pn-text-sm" style="color:var(--pn-color-on-dark-muted);">Activo · iniciado el 14 abr</p>
            <div class="mb-package__bar"><div class="mb-package__bar-fill"></div></div>
            <p class="pn-text-sm" style="color:var(--pn-color-on-dark);"><strong>7 de 10 usadas</strong> · 3 restantes</p>
            <p class="pn-text-xs" style="margin-top:10px;color:var(--pn-color-on-dark-muted);">Vigencia: 31 dias restantes</p>
            <button type="button" class="pn-btn pn-btn--ghost-light">Renovar paquete</button>
          </div>

          <div class="mb-atajos">
            <div class="pn-eyebrow" style="margin-bottom:12px;">Atajos</div>
            <a href="#">Reservar una clase</a>
            <a href="#">Ver mis paquetes y facturas</a>
            <a href="#">Editar mi perfil</a>
            <a href="#">Metodos de pago</a>
            <a href="#">Pausar membresia</a>
          </div>

          <div class="mb-reco">
            <p class="pn-text-sm" style="margin-bottom:12px;">Has tomado mucho yoga. Probar Pilates Reformer?</p>
            <button type="button" class="pn-btn pn-btn--primary pn-btn--sm">Ver disponibilidad</button>
          </div>
        </aside>
      </div>

      <footer class="mb-footer">
        <span>2026 Estudio Popnest</span>
        <span>Ayuda · Terminos · Privacidad · Cerrar sesion</span>
      </footer>
    </div>
  </body>
</html>`

function MyBookingsRedesign() {
  return (
    <iframe
      title="Mis reservas rediseño preview"
      srcDoc={previewHtml}
      className="block h-screen w-full border-0"
    />
  )
}

export default MyBookingsRedesign
