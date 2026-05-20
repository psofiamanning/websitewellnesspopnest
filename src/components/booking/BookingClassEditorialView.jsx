import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Calendar from '../Calendar'
import StripeCardElement from '../StripeCardElement'
import { SINGLE_CLASS_PRICE_MXN } from '../../config/pricing'

const SINGLE_CLASS_PRICE_LABEL = `$${SINGLE_CLASS_PRICE_MXN.toFixed(2)} MXN`
const BOOKING_NAV_SCROLL_OFFSET_PX = 104

function scrollBelowFixedNav(el, offsetPx = BOOKING_NAV_SCROLL_OFFSET_PX) {
  if (!el || typeof window === 'undefined') return
  const y = el.getBoundingClientRect().top + window.scrollY - offsetPx
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}

function BookingClassEditorialView({
  classInfo,
  teacher,
  selectedDate,
  selectedTime,
  availableDates,
  availableTimes,
  customerInfo,
  onCustomerChange,
  userPackages,
  usePackage,
  setUsePackage,
  selectedPackageId,
  setSelectedPackageId,
  cardholderName,
  setCardholderName,
  setStripeCardData,
  isAuthenticated,
  isFormValid,
  isProcessing,
  formValidationMessage,
  selectDateError,
  selectTimeError,
  onDateSelect,
  onTimeSelect,
  onBooking,
  onClearDate,
  onClearTime,
  discountCodeInput,
  setDiscountCodeInput,
  appliedDiscount,
  discountError,
  discountMessage,
  isValidatingDiscount,
  onApplyDiscountCode,
  onRemoveDiscountCode,
}) {
  const classSlug = classInfo.name.toLowerCase()
  const descParagraphs = (classInfo.fullDescription || classInfo.description || '')
    .split('\n\n')
    .filter(Boolean)

  const stepDate = selectedDate ? 'done' : 'active'
  const stepTime = selectedDate ? (selectedTime ? 'done' : 'active') : ''
  const stepConfirm = selectedTime ? 'active' : ''

  const formatPackageAvailability = (pkg) => {
    const remaining = Number(pkg?.classesRemaining ?? pkg?.classes ?? 0)
    const count = `${remaining} ${remaining === 1 ? 'clase disponible' : 'clases disponibles'}`
    return pkg?.adminGranted ? `${count} · otorgadas por el estudio` : count
  }

  const selectedPackage =
    usePackage && selectedPackageId
      ? userPackages?.packages?.find((p) => p.id === selectedPackageId)
      : null

  const packageLabel = selectedPackage
    ? `${selectedPackage.packageName} (${formatPackageAvailability(selectedPackage)})`
    : null

  const paymentSummary = appliedDiscount
    ? `Gratis · código ${appliedDiscount.code}`
    : packageLabel
      ? packageLabel
      : `Pago con tarjeta · ${SINGLE_CLASS_PRICE_LABEL}`

  const timeSectionRef = useRef(null)
  const confirmSectionRef = useRef(null)
  const shouldScrollToTime = useRef(false)
  const shouldScrollToConfirm = useRef(false)

  const handleDateSelect = (date) => {
    shouldScrollToTime.current = true
    onDateSelect(date)
  }

  const handleTimeSelect = (time) => {
    shouldScrollToConfirm.current = true
    onTimeSelect(time)
  }

  useEffect(() => {
    if (!selectedDate || !shouldScrollToTime.current) return
    shouldScrollToTime.current = false
    const timer = window.setTimeout(() => {
      scrollBelowFixedNav(timeSectionRef.current)
      timeSectionRef.current?.focus({ preventScroll: true })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [selectedDate])

  useEffect(() => {
    if (!selectedTime || !shouldScrollToConfirm.current) return
    shouldScrollToConfirm.current = false
    const timer = window.setTimeout(() => {
      scrollBelowFixedNav(confirmSectionRef.current)
      confirmSectionRef.current?.focus({ preventScroll: true })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [selectedTime])

  return (
    <div className="bk-page bk-page--with-site-nav">
      <div className="bk-shell">
        <div className="bk-top">
          <Link to="/horario" className="bk-back">
            ← Volver al horario
          </Link>
          <div className="bk-steps" aria-label="Pasos de reserva">
            <span className="bk-step bk-step--done">1. Práctica</span>
            <span className={`bk-step${stepDate ? ` bk-step--${stepDate}` : ''}`}>2. Fecha</span>
            <span className={`bk-step${stepTime ? ` bk-step--${stepTime}` : ''}`}>3. Horario</span>
            <span className={`bk-step${stepConfirm ? ` bk-step--${stepConfirm}` : ''}`}>4. Confirmar</span>
          </div>
        </div>

        <header className="bk-hero">
          <h1 className="bk-hero__title">
            Reserva <em className="pn-serif">{classSlug}.</em>
          </h1>
          <dl className="bk-hero__meta">
            <div className="bk-hero__meta-row">
              <dt>Disciplina</dt>
              <dd>{classInfo.name}</dd>
            </div>
            <div className="bk-hero__meta-row">
              <dt>Horario</dt>
              <dd>Con {classInfo.teacher}</dd>
            </div>
            <div className="bk-hero__meta-row">
              <dt>Duración</dt>
              <dd>{classInfo.duration} minutos · salón principal</dd>
            </div>
          </dl>
        </header>

        <div className="bk-layout">
          <div className="bk-flow">
            <section className="bk-block" aria-labelledby="bk-date-heading">
              <div className="bk-block__head">
                <span className="bk-block__num">01</span>
                <h2 id="bk-date-heading" className="bk-block__title">
                  Elige una fecha
                </h2>
              </div>
              <div className="bk-calendar-wrap">
                <Calendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>
              {selectedDate && !selectedTime ? (
                <p className="bk-flow-cue" role="status">
                  <span className="bk-flow-cue__icon" aria-hidden>
                    ↓
                  </span>
                  Siguiente paso: elige un horario
                </p>
              ) : null}
              {selectDateError ? <p className="bk-alert" role="alert">{selectDateError}</p> : null}
            </section>

            {selectedDate ? (
              <section
                ref={timeSectionRef}
                tabIndex={-1}
                className="bk-block bk-block--focus"
                aria-labelledby="bk-time-heading"
              >
                <div className="bk-block__head">
                  <span className="bk-block__num">02</span>
                  <h2 id="bk-time-heading" className="bk-block__title">
                    Elige un horario
                  </h2>
                </div>
                {availableTimes.length > 0 ? (
                  <div className="bk-times">
                    {availableTimes.map((time) => {
                      const active = selectedTime === time
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`bk-time-slot${active ? ' bk-time-slot--active' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                          aria-pressed={active}
                        >
                          <div>
                            <div className="bk-time-slot__time">{time}</div>
                            <p className="bk-time-slot__label">{classInfo.name}</p>
                          </div>
                          <span className="bk-time-slot__spots">Reserva en línea</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="pn-text-sm" style={{ color: 'var(--pn-color-text-muted)' }}>
                    No hay horarios para esta fecha. Elige otro día.
                  </p>
                )}
                {selectTimeError ? <p className="bk-alert" role="alert">{selectTimeError}</p> : null}
              </section>
            ) : null}

            {selectedTime ? (
              <section
                ref={confirmSectionRef}
                tabIndex={-1}
                className="bk-block bk-block--focus"
                aria-labelledby="bk-confirm-heading"
              >
                <div className="bk-block__head">
                  <span className="bk-block__num">03</span>
                  <h2 id="bk-confirm-heading" className="bk-block__title">
                    Confirma tu reserva
                  </h2>
                </div>

                <dl className="bk-confirm-list">
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Práctica</dt>
                      <dd>{classInfo.name}</dd>
                    </div>
                    <span />
                    <span />
                  </div>
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Fecha</dt>
                      <dd>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</dd>
                    </div>
                    <button type="button" className="bk-confirm-change" onClick={onClearDate}>
                      Cambiar
                    </button>
                    <span />
                  </div>
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Horario</dt>
                      <dd>{selectedTime}</dd>
                    </div>
                    <button type="button" className="bk-confirm-change" onClick={onClearTime}>
                      Cambiar
                    </button>
                    <span />
                  </div>
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Maestra</dt>
                      <dd>{classInfo.teacher}</dd>
                    </div>
                    <span />
                    <span />
                  </div>
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Lugar</dt>
                      <dd>Salón principal · Del Carmen</dd>
                    </div>
                    <span />
                    <span />
                  </div>
                  <div className="bk-confirm-row">
                    <div>
                      <dt>Paquete</dt>
                      <dd>{paymentSummary}</dd>
                    </div>
                    <span />
                    <span />
                  </div>
                </dl>

                {appliedDiscount ? (
                  <p className="bk-package-note">Clase gratis con código de descuento</p>
                ) : usePackage && packageLabel ? (
                  <p className="bk-package-note">Descuenta 1 clase de tu paquete</p>
                ) : null}

                {!isAuthenticated && (
                  <p className="bk-alert">
                    <Link to={`/login?from=${encodeURIComponent(`/booking/class/${classInfo.id}`)}`}>
                      Inicia sesión
                    </Link>{' '}
                    para usar un paquete de clases.
                  </p>
                )}

                <div className="bk-form-panel">
                  <div className="bk-form-grid">
                    <div className="bk-field">
                      <label htmlFor="bk-first">Nombre *</label>
                      <input
                        id="bk-first"
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) => onCustomerChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="bk-field">
                      <label htmlFor="bk-last">Apellido *</label>
                      <input
                        id="bk-last"
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) => onCustomerChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="bk-field bk-field--full">
                      <label htmlFor="bk-email">Correo *</label>
                      <input
                        id="bk-email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => onCustomerChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="bk-field bk-field--full">
                      <label htmlFor="bk-phone">Teléfono *</label>
                      <input
                        id="bk-phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          onCustomerChange('phone', e.target.value.replace(/[^0-9+-\s]/gi, ''))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="bk-discount">
                    <label htmlFor="bk-discount">Código de descuento</label>
                    {appliedDiscount ? (
                      <div className="bk-discount-applied">
                        <p className="bk-discount-applied__text">
                          <strong>{appliedDiscount.code}</strong> aplicado — {appliedDiscount.label}
                        </p>
                        <button
                          type="button"
                          className="bk-confirm-change"
                          onClick={onRemoveDiscountCode}
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="bk-discount-row">
                        <input
                          id="bk-discount"
                          type="text"
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                          placeholder="Ej. BIENVENIDA"
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <button
                          type="button"
                          className="pn-btn pn-btn--secondary"
                          disabled={isValidatingDiscount}
                          onClick={onApplyDiscountCode}
                        >
                          {isValidatingDiscount ? 'Verificando…' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    {discountMessage ? (
                      <p className="bk-discount-ok" role="status">
                        {discountMessage}
                      </p>
                    ) : null}
                    {discountError ? (
                      <p className="bk-alert" role="alert">
                        {discountError}
                      </p>
                    ) : null}
                  </div>

                  {!appliedDiscount && userPackages?.hasActivePackages ? (
                    <div style={{ marginTop: 20 }}>
                      <p className="pn-text-sm" style={{ marginBottom: 12, color: 'var(--pn-color-text-muted)' }}>
                        Método de pago
                      </p>
                      {userPackages.packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 8,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name="bk-pay"
                            checked={usePackage && selectedPackageId === pkg.id}
                            onChange={() => {
                              onRemoveDiscountCode()
                              setUsePackage(true)
                              setSelectedPackageId(pkg.id)
                            }}
                          />
                          {pkg.packageName}
                          {pkg.adminGranted ? ' ★' : ''} ({formatPackageAvailability(pkg)})
                        </label>
                      ))}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="bk-pay"
                          checked={!usePackage}
                          onChange={() => {
                            setUsePackage(false)
                            setSelectedPackageId(null)
                          }}
                        />
                        Tarjeta · {SINGLE_CLASS_PRICE_LABEL}
                      </label>
                    </div>
                  ) : null}

                  {!appliedDiscount && !usePackage ? (
                    <div style={{ marginTop: 20 }}>
                      <StripeCardElement
                        onCardReady={setStripeCardData}
                        cardholderName={cardholderName}
                        setCardholderName={setCardholderName}
                      />
                    </div>
                  ) : null}
                </div>

                {formValidationMessage ? (
                  <p className="bk-alert" role="alert">
                    {formValidationMessage}
                  </p>
                ) : null}

                <button
                  type="button"
                  className="pn-btn pn-btn--primary pn-btn--block"
                  disabled={isProcessing}
                  onClick={onBooking}
                >
                  {isProcessing
                    ? 'Procesando…'
                    : appliedDiscount
                      ? 'Confirmar reserva gratis →'
                      : usePackage
                        ? 'Confirmar reserva →'
                        : `Confirmar reserva · ${SINGLE_CLASS_PRICE_LABEL} →`}
                </button>
              </section>
            ) : null}
          </div>

          <aside className="bk-aside">
            <h2 className="bk-aside__title">
              {classInfo.name.split(' ')[0]}{' '}
              <em className="pn-serif">{classInfo.name.split(' ').slice(1).join(' ').toLowerCase() || 'práctica'}.</em>
            </h2>
            {descParagraphs[0] ? (
              <p className="bk-aside__quote">&ldquo;{descParagraphs[0].trim().slice(0, 120)}…&rdquo;</p>
            ) : null}
            {descParagraphs[0] ? (
              <div className="bk-aside__section">
                <h3>Al método</h3>
                <p>{descParagraphs[0].trim()}</p>
              </div>
            ) : null}
            {descParagraphs[1] ? (
              <div className="bk-aside__section">
                <h3>Qué esperar</h3>
                <p>{descParagraphs[1].trim()}</p>
              </div>
            ) : null}
            {teacher ? (
              <div className="bk-coach-card">
                {teacher.image ? (
                  <img src={teacher.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <div style={{ width: 72, height: 72, background: 'var(--pn-color-bg-secondary)' }} />
                )}
                <div>
                  <p className="bk-coach-card__name">{teacher.name}</p>
                  <p className="bk-coach-card__meta">
                    {teacher.specialty?.split('·')[0]?.trim() || 'Coach'} · Estudio Popnest
                  </p>
                </div>
              </div>
            ) : null}
            <dl className="bk-specs">
              <div className="bk-spec">
                <dt>Nivel</dt>
                <dd>Abierto</dd>
              </div>
              <div className="bk-spec">
                <dt>Cupo</dt>
                <dd>8 personas</dd>
              </div>
              <div className="bk-spec">
                <dt>Duración</dt>
                <dd>{classInfo.duration} minutos</dd>
              </div>
              <div className="bk-spec">
                <dt>Idioma</dt>
                <dd>Español</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default BookingClassEditorialView
