import tokensCss from '../styles/tokens.css?raw'
import baseCss from '../styles/base.css?raw'
import componentsCss from '../styles/components.css?raw'

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

      .pkg-shell {
        --pn-text-h1: 56px;
        --pn-text-h2: 44px;
        --pn-text-h3: 32px;
        --pn-text-h4: 26px;
        --pn-text-lg: 21px;
        --pn-text-base: 17px;
        --pn-text-sm: 15px;
        --pn-text-xs: 14px;
        --pn-text-eyebrow: 12px;
        max-width: 1440px;
        margin: 0 auto;
        background: var(--pn-color-bg-base);
        border-left: var(--pn-border-soft);
        border-right: var(--pn-border-soft);
      }

      .pkg-nav {
        height: 72px;
        padding: 0 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: var(--pn-border-soft);
      }
      .pkg-nav__links { display: flex; gap: 28px; align-items: center; }
      .pkg-nav__link {
        font-size: 12px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text);
      }
      .pkg-menu { display: none; flex-direction: column; gap: 4px; }
      .pkg-menu span { width: 18px; height: 1px; background: var(--pn-color-text); }

      .pkg-hero {
        padding: 88px 76px 72px;
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
        gap: 64px;
        align-items: end;
        border-bottom: var(--pn-border-soft);
      }
      .pkg-hero__title {
        font-size: clamp(52px, 6vw, 92px);
        line-height: 0.95;
        letter-spacing: -0.05em;
        color: var(--pn-color-text);
      }
      .pkg-hero__copy { max-width: 420px; }
      .pkg-hero__actions { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }

      .pkg-section { padding: 72px 76px; border-bottom: var(--pn-border-soft); }
      .pkg-section--warm { background: var(--pn-color-bg-warm); }
      .pkg-section__head { margin-bottom: 40px; max-width: 720px; }

      .pkg-pricing {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        align-items: stretch;
      }
      .pkg-card {
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-elevated);
        padding: 32px 28px 36px;
        display: flex;
        flex-direction: column;
        min-height: 420px;
      }
      .pkg-card--dark {
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
        border-color: var(--pn-color-bg-dark);
      }
      .pkg-card__eyebrow {
        font-size: 11px;
        letter-spacing: var(--pn-tracking-widest);
        text-transform: uppercase;
        color: var(--pn-color-text-subtle);
        margin-bottom: 12px;
      }
      .pkg-card--dark .pkg-card__eyebrow { color: var(--pn-color-on-dark-muted); }
      .pkg-card__price {
        font-size: clamp(40px, 4vw, 56px);
        line-height: 1;
        letter-spacing: var(--pn-tracking-snug);
        margin: 8px 0 20px;
      }
      .pkg-card--dark .pkg-card__price { color: var(--pn-color-on-dark); }
      .pkg-card__sub { font-size: 14px; color: var(--pn-color-text-muted); margin-bottom: 22px; }
      .pkg-card--dark .pkg-card__sub { color: var(--pn-color-on-dark-muted); }
      .pkg-card ul {
        list-style: none;
        padding: 0;
        margin: 0 0 auto;
        flex: 1;
      }
      .pkg-card li {
        padding: 10px 0;
        border-top: 0.5px solid rgba(122, 107, 84, 0.25);
        font-size: 15px;
        line-height: 1.45;
        color: var(--pn-color-text-soft);
      }
      .pkg-card--dark li {
        border-color: rgba(244, 237, 226, 0.15);
        color: var(--pn-color-on-dark-muted);
      }
      .pkg-card .pn-btn { margin-top: 24px; width: 100%; }
      .pkg-card--dark .pn-btn--primary {
        background: var(--pn-color-on-dark);
        color: var(--pn-color-bg-dark);
      }
      .pkg-card--dark .pn-btn--primary:hover {
        background: var(--pn-color-on-dark-soft);
      }

      .pkg-single {
        margin-top: 20px;
        padding: 22px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        border: var(--pn-border-thin);
        background: var(--pn-color-bg-secondary);
      }
      .pkg-single__label { font-size: 13px; letter-spacing: var(--pn-tracking-wider); text-transform: uppercase; }
      .pkg-single__price { font-size: 22px; font-weight: var(--pn-weight-medium); }

      .pkg-includes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 28px 36px;
      }
      .pkg-include h3 { font-size: 17px; margin: 10px 0 8px; }
      .pkg-include p { font-size: 15px; color: var(--pn-color-text-soft); line-height: 1.55; }

      .pkg-faq .pn-faq-item__question { font-size: 18px; }
      .pkg-faq .pn-text-sm { font-size: 15px; padding-top: 8px; }

      .pkg-cta {
        padding: 72px 76px;
        background: var(--pn-color-bg-dark);
        color: var(--pn-color-on-dark);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: center;
      }
      .pkg-cta h2 { color: var(--pn-color-on-dark); }

      .pkg-footer {
        padding: 52px 76px 28px;
        background: var(--pn-color-bg-secondary);
      }
      .pkg-footer__grid {
        display: grid;
        grid-template-columns: 1.3fr repeat(3, 1fr);
        gap: 40px;
        padding-bottom: 40px;
        border-bottom: var(--pn-border-soft);
      }
      .pkg-footer__bottom {
        padding-top: 18px;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        letter-spacing: var(--pn-tracking-wider);
        text-transform: uppercase;
        color: var(--pn-color-text-muted);
      }

      @media (max-width: 900px) {
        .pkg-shell {
          --pn-text-h1: 40px;
          --pn-text-h2: 34px;
          --pn-text-h3: 28px;
          border: none;
        }
        .pkg-nav { padding: 0 20px; height: 62px; }
        .pkg-nav__links { display: none; }
        .pkg-menu { display: flex; }
        .pkg-hero,
        .pkg-section,
        .pkg-cta,
        .pkg-footer { padding-left: 24px; padding-right: 24px; }
        .pkg-hero { display: block; padding-top: 48px; }
        .pkg-hero__title { font-size: 42px; }
        .pkg-hero__copy { margin-top: 22px; max-width: none; }
        .pkg-hero__actions { flex-direction: column; }
        .pkg-pricing,
        .pkg-includes,
        .pkg-cta,
        .pkg-footer__grid { grid-template-columns: 1fr; }
        .pkg-card { min-height: auto; }
        .pkg-footer__bottom { flex-direction: column; gap: 8px; }
        .pkg-single { flex-direction: column; align-items: flex-start; }
      }
    </style>
  </head>
  <body>
    <div class="pkg-shell">
      <nav class="pkg-nav">
        <div class="pn-nav__logo">
          <span class="pn-serif pn-nav__logo-e">e</span>
          <span class="pn-nav__logo-name">studio popnest</span>
        </div>
        <div class="pkg-nav__links">
          <a class="pkg-nav__link" href="#">Practicas</a>
          <a class="pkg-nav__link" href="#">Horario</a>
          <a class="pkg-nav__link" href="#">Maestras</a>
          <a class="pkg-nav__link" href="#">Paquetes</a>
          <button class="pn-btn pn-btn--primary pn-btn--sm">Comprar</button>
        </div>
        <button class="pkg-menu" type="button" aria-label="Menu"><span></span><span></span></button>
      </nav>

      <main>
        <section class="pkg-hero">
          <div>
            <div class="pn-eyebrow pn-divider-editorial" style="margin-bottom: 22px;">Membresias y paquetes</div>
            <h1 class="pkg-hero__title">
              Tu compromiso,<br />
              tu <span class="pn-serif" style="color: var(--pn-color-primary);">ritmo.</span>
            </h1>
          </div>
          <div class="pkg-hero__copy">
            <p class="pn-text-lg">
              Elige un paquete que encaje con tu semana o un pase ilimitado si quieres practicar cada dia.
              Todos incluyen lo esencial para llegar y empezar.
            </p>
            <div class="pkg-hero__actions">
              <button type="button" class="pn-btn pn-btn--primary">Ver paquetes</button>
              <button type="button" class="pn-btn pn-btn--ghost">Hablar por WhatsApp</button>
            </div>
          </div>
        </section>

        <section class="pkg-section">
          <div class="pkg-section__head">
            <div class="pn-eyebrow" style="margin-bottom: 14px;">Para quien practica</div>
            <h2 class="pn-h1">Paquetes que se sienten <span class="pn-serif" style="color: var(--pn-color-primary);">reales.</span></h2>
          </div>
          <div class="pkg-pricing">
            <article class="pkg-card">
              <div class="pkg-card__eyebrow">Entrada suave</div>
              <h3 class="pn-h4">5 clases</h3>
              <div class="pkg-card__price">$1,000</div>
              <p class="pkg-card__sub">MXN · $200 c/u · ahorra $250 vs 5 sueltas · vigencia 60 dias</p>
              <ul>
                <li>5 × clase suelta serian $1,250</li>
                <li>Usa en yoga, pilates y meditacion</li>
                <li>Renovable cuando quieras</li>
              </ul>
              <button type="button" class="pn-btn pn-btn--ghost pn-btn--block">Elegir 5 clases</button>
            </article>
            <article class="pkg-card pkg-card--dark">
              <div class="pkg-card__eyebrow">Practica sin limite</div>
              <h3 class="pn-h4" style="color: var(--pn-color-on-dark);">Ilimitado mensual</h3>
              <div class="pkg-card__price">$2,400</div>
              <p class="pkg-card__sub">MXN al mes · cancela cuando quieras</p>
              <ul>
                <li>Acceso ilimitado al horario regular</li>
                <li>Prioridad en listas de espera</li>
                <li>Renovable mes a mes</li>
              </ul>
              <button type="button" class="pn-btn pn-btn--primary pn-btn--block">Suscribirme</button>
            </article>
            <article class="pkg-card">
              <div class="pkg-card__eyebrow">Compromiso medio</div>
              <h3 class="pn-h4">10 clases</h3>
              <div class="pkg-card__price">$2,000</div>
              <p class="pkg-card__sub">MXN · ~$200 por clase · vigencia 90 dias</p>
              <ul>
                <li>Mejor precio por clase frente a la suelta</li>
                <li>Comparte con un familiar (misma cuenta)</li>
                <li>Congela hasta 15 dias una vez</li>
              </ul>
              <button type="button" class="pn-btn pn-btn--ghost pn-btn--block">Elegir 10 clases</button>
            </article>
          </div>
          <div class="pkg-single">
            <span class="pkg-single__label">Clase suelta</span>
            <span class="pkg-single__price">$250 MXN</span>
            <button type="button" class="pn-btn pn-btn--sm pn-btn--ghost">Reservar una clase</button>
          </div>
        </section>

        <section class="pkg-section pkg-section--warm">
          <div class="pkg-section__head">
            <div class="pn-eyebrow" style="margin-bottom: 14px;">Transparencia</div>
            <h2 class="pn-h2">Lo que incluye <span class="pn-serif" style="color: var(--pn-color-primary);">cualquier paquete.</span></h2>
          </div>
          <div class="pkg-includes">
            <div class="pkg-include">
              <span class="pn-dot pn-dot--yoga"></span>
              <h3>Tapete profesional</h3>
              <p>Tapete de alta densidad listo en sala. No necesitas traer el tuyo.</p>
            </div>
            <div class="pkg-include">
              <span class="pn-dot pn-dot--pilates"></span>
              <h3>Bloques y cinta</h3>
              <p>Props para adaptar posturas y sostener la practica con seguridad.</p>
            </div>
            <div class="pkg-include">
              <span class="pn-dot pn-dot--meditation"></span>
              <h3>Lockers</h3>
              <p>Casilleros para guardar tus cosas de forma segura durante la clase.</p>
            </div>
            <div class="pkg-include">
              <span class="pn-dot pn-dot--sound"></span>
              <h3>Te e infusiones</h3>
              <p>Una pausa despues de practicar para bajar el ritmo con calma.</p>
            </div>
            <div class="pkg-include">
              <span class="pn-dot pn-dot--taichi"></span>
              <h3>Equipo humano</h3>
              <p>Maestras presentes, grupos contenidos y atencion cercana.</p>
            </div>
            <div class="pkg-include">
              <span class="pn-dot pn-dot--yoga"></span>
              <h3>Reserva en linea</h3>
              <p>Elige clase y horario desde la web sin filas ni llamadas.</p>
            </div>
          </div>
        </section>

        <section class="pkg-section pkg-faq">
          <div class="pkg-section__head">
            <div class="pn-eyebrow" style="margin-bottom: 14px;">Dudas comunes</div>
            <h2 class="pn-h2">Preguntas <span class="pn-serif" style="color: var(--pn-color-primary);">honestas.</span></h2>
          </div>
          <div>
            <div class="pn-faq-item">
              <div class="pn-faq-item__question">Pagos<span class="pn-faq-item__arrow">+</span></div>
              <p class="pn-text-sm">Todos los pagos son en linea, de forma segura, desde la web.</p>
            </div>
          </div>
        </section>

        <section class="pkg-cta">
          <div>
            <div class="pn-eyebrow pn-eyebrow--on-dark" style="margin-bottom: 14px;">Primera vez</div>
            <h2 class="pn-h3">Tu primera clase, <span class="pn-serif" style="color: var(--pn-color-primary);">por nosotros.</span></h2>
          </div>
          <div>
            <p class="pn-text-lg" style="color: var(--pn-color-on-dark-muted); margin-bottom: 18px;">Déjanos tu correo y te enviamos un codigo de bienvenida.</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <input class="pn-field__input" type="email" placeholder="tu@email.com" style="max-width:260px; flex:1;" />
              <button type="button" class="pn-btn pn-btn--ghost-light">Suscribirme</button>
            </div>
          </div>
        </section>
      </main>

      <footer class="pkg-footer">
        <div class="pkg-footer__grid">
          <div>
            <div class="pn-nav__logo" style="margin-bottom: 14px;">
              <span class="pn-serif pn-nav__logo-e">e</span>
              <span class="pn-nav__logo-name">studio popnest</span>
            </div>
            <p class="pn-text-sm">Paquetes y membresias para practicar con calma en Coyoacan.</p>
          </div>
          <div>
            <div class="pn-footer__col-title">Estudio</div>
            <a class="pn-footer__link">Horario</a>
            <a class="pn-footer__link">Maestras</a>
            <a class="pn-footer__link">Paquetes</a>
          </div>
          <div>
            <div class="pn-footer__col-title">Visitanos</div>
            <p class="pn-text-sm">Londres 105<br />Coyoacan, CDMX</p>
          </div>
          <div>
            <div class="pn-footer__col-title">Contacto</div>
            <p class="pn-text-sm">info@estudiopopnest.com</p>
          </div>
        </div>
        <div class="pkg-footer__bottom">
          <span>2026 Estudio Popnest</span>
          <span>Instagram · WhatsApp</span>
        </div>
      </footer>
    </div>
  </body>
</html>`

function PackagesRedesign() {
  return (
    <iframe
      title="Paquetes rediseño preview"
      srcDoc={previewHtml}
      className="block h-screen w-full border-0"
    />
  )
}

export default PackagesRedesign
