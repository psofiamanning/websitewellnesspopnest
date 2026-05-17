import tokensCss from '../styles/tokens.css?raw'
import baseCss from '../styles/base.css?raw'
import componentsCss from '../styles/components.css?raw'
import logoUrl from '../assets/logo.svg?url'

const previewHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/400.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/500.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif/400.css" />
    <style>
      ${tokensCss}
      ${baseCss}
      ${componentsCss}

      .preview-shell {
        min-height: 100vh;
        background: var(--pn-color-bg-base);
      }

      .preview-hero {
        padding: 72px 32px 56px;
        background: var(--pn-color-bg-warm);
        border-bottom: var(--pn-border-soft);
      }

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .preview-section {
        padding: 56px 32px;
      }

      .preview-stack {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
      }

      .preview-color {
        min-height: 110px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        border: var(--pn-border-thin);
      }

      .preview-swatch-primary { background: var(--pn-color-primary); color: #fff; }
      .preview-swatch-base { background: var(--pn-color-bg-base); }
      .preview-swatch-elevated { background: var(--pn-color-bg-elevated); }
      .preview-swatch-secondary { background: var(--pn-color-bg-secondary); }
      .preview-swatch-dark { background: var(--pn-color-bg-dark); color: var(--pn-color-on-dark); }
      .preview-swatch-warm { background: var(--pn-color-bg-warm); }

      .preview-two-col {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
        gap: 28px;
      }

      .preview-card-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      @media (max-width: 900px) {
        .preview-grid,
        .preview-two-col,
        .preview-card-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="preview-shell">
      <section class="preview-hero">
        <div class="pn-container">
          <div class="pn-nav__logo pn-nav__logo--official" style="margin-bottom: 42px;">
            <img src="${logoUrl}" alt="Estudio Popnest Wellness" style="height:52px;width:auto;display:block;max-width:260px;object-fit:contain;" />
          </div>
          <div class="pn-eyebrow pn-divider-editorial" style="margin-bottom: 20px;">Design system preview</div>
          <h1 class="pn-display-lg">
            Breathe, move,
            <span class="pn-serif" style="color: var(--pn-color-primary);"> reconnect.</span>
          </h1>
          <p class="pn-text-lg" style="max-width: 620px; margin-top: 22px;">
            A staged preview of the Popnest editorial design system: tokens, type, buttons,
            form fields, cards, schedule rows, and practice dots.
          </p>
          <div class="preview-stack" style="margin-top: 30px;">
            <button class="pn-btn pn-btn--primary">Reserve a class</button>
            <button class="pn-btn pn-btn--ghost">View schedule</button>
          </div>
        </div>
      </section>

      <section class="preview-section">
        <div class="pn-container">
          <div class="pn-eyebrow pn-eyebrow--red" style="margin-bottom: 18px;">Palette</div>
          <div class="preview-grid">
            <div class="preview-color preview-swatch-primary"><strong>Primary</strong><span>#b73d37</span></div>
            <div class="preview-color preview-swatch-base"><strong>Base</strong><span>#f4ede2</span></div>
            <div class="preview-color preview-swatch-elevated"><strong>Elevated</strong><span>#fbf6ec</span></div>
            <div class="preview-color preview-swatch-secondary"><strong>Secondary</strong><span>#ede4d2</span></div>
            <div class="preview-color preview-swatch-warm"><strong>Warm</strong><span>#d8c5af</span></div>
            <div class="preview-color preview-swatch-dark"><strong>Dark</strong><span>#2d2e35</span></div>
          </div>
        </div>
      </section>

      <section class="preview-section pn-section--bg-secondary">
        <div class="pn-container preview-two-col">
          <div>
            <div class="pn-eyebrow" style="margin-bottom: 18px;">Typography</div>
            <h2 class="pn-h1">Nuestras <span class="pn-serif" style="color: var(--pn-color-primary);">practicas.</span></h2>
            <p class="pn-text-lg" style="margin-top: 18px;">DM Sans keeps the interface grounded, while Instrument Serif adds an editorial accent.</p>
            <div style="margin-top: 28px;">
              <h3 class="pn-h3">Heading h3 sample</h3>
              <p class="pn-text">Body copy sample with relaxed line-height and warm editorial spacing.</p>
              <p class="pn-text-xs">Caption / helper text sample.</p>
            </div>
          </div>
          <div class="pn-card">
            <div class="pn-card__body">
              <div class="pn-eyebrow pn-eyebrow--red" style="margin-bottom: 14px;">Components</div>
              <div class="preview-stack">
                <button class="pn-btn pn-btn--primary">Primary</button>
                <button class="pn-btn pn-btn--ghost">Ghost</button>
                <button class="pn-btn pn-btn--sm">Small</button>
              </div>
              <div style="margin-top: 24px;">
                <div class="pn-field">
                  <label class="pn-field__label">Email</label>
                  <input class="pn-field__input" type="email" placeholder="tu@email.com" />
                  <span class="pn-field__hint">Used to confirm your reservation.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-section">
        <div class="pn-container">
          <div class="pn-eyebrow pn-divider-editorial" style="margin-bottom: 24px;">Schedule patterns</div>
          <div class="preview-two-col">
            <div class="pn-card">
              <div class="pn-card__body">
                <div class="pn-class-row">
                  <span class="pn-class-row__time">09:30</span>
                  <span class="pn-dot pn-dot--pilates"></span>
                  <div>
                    <div class="pn-class-row__name">Pilates</div>
                    <div class="pn-class-row__coach">con <span class="pn-serif">Blanca Bear</span></div>
                  </div>
                  <span class="pn-class-row__duration">60 min</span>
                  <span class="pn-class-row__arrow">-&gt;</span>
                </div>
                <div class="pn-class-row">
                  <span class="pn-class-row__time">11:00</span>
                  <span class="pn-dot pn-dot--yoga"></span>
                  <div>
                    <div class="pn-class-row__name">Yoga</div>
                    <div class="pn-class-row__coach">con <span class="pn-serif">Popnest Coach</span></div>
                  </div>
                  <span class="pn-class-row__duration">75 min</span>
                  <span class="pn-class-row__arrow">-&gt;</span>
                </div>
                <div class="pn-class-row">
                  <span class="pn-class-row__time">18:30</span>
                  <span class="pn-dot pn-dot--sound"></span>
                  <div>
                    <div class="pn-class-row__name">Sound Healing</div>
                    <div class="pn-class-row__coach">con <span class="pn-serif">Invitado</span></div>
                  </div>
                  <span class="pn-class-row__duration">60 min</span>
                  <span class="pn-class-row__arrow">-&gt;</span>
                </div>
              </div>
            </div>

            <div>
              <div class="preview-card-grid">
                <div class="pn-practice-card">
                  <span class="pn-dot pn-dot--yoga"></span>
                  <h3 class="pn-h4">Yoga</h3>
                  <p class="pn-text-sm">Movimiento consciente, respiracion y presencia.</p>
                  <span class="pn-practice-card__arrow">-&gt;</span>
                </div>
                <div class="pn-practice-card">
                  <span class="pn-dot pn-dot--meditation"></span>
                  <h3 class="pn-h4">Meditacion</h3>
                  <p class="pn-text-sm">Pausa, claridad y practica contemplativa.</p>
                  <span class="pn-practice-card__arrow">-&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-section pn-section--bg-dark">
        <div class="pn-container preview-two-col">
          <div>
            <div class="pn-eyebrow pn-eyebrow--on-dark" style="margin-bottom: 18px;">Dark surface</div>
            <h2 class="pn-h2" style="color: var(--pn-color-on-dark);">Una pausa para <span class="pn-serif" style="color: var(--pn-color-on-dark-soft);">volver.</span></h2>
            <p class="pn-text-lg" style="color: var(--pn-color-on-dark-muted); margin-top: 18px;">The system includes inverse colors for darker editorial sections.</p>
          </div>
          <div class="preview-stack" style="align-content: flex-start;">
            <button class="pn-btn pn-btn--ghost-light">Ghost light</button>
            <span class="pn-tag"><span class="pn-dot pn-dot--taichi"></span>Tai Chi</span>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`

function DesignSystem() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Preview</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-800">Popnest Design System</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            This preview is isolated in an iframe, so the new design-system CSS does not change the
            rest of the current website while we review it.
          </p>
        </div>
        <iframe
          title="Popnest design system preview"
          srcDoc={previewHtml}
          className="h-[780px] w-full rounded-xl border border-gray-200 bg-white shadow-lg"
        />
      </div>
    </main>
  )
}

export default DesignSystem
