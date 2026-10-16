import { useEffect, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'

// Selector de fecha en formato de México (dd/mm/aaaa, semana que empieza en lunes).
// Sustituye a <input type="date">, que muestra el formato del navegador (mm/dd/yyyy en EE. UU.).
// value / min / max en 'yyyy-MM-dd' (igual que el input nativo); onChange recibe ese string o ''.

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const toIso = (d) => format(d, 'yyyy-MM-dd')

export function formatDateMx(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function DateInput({
  value,
  onChange,
  min,
  max,
  disabled = false,
  required = false,
  placeholder = 'dd/mm/aaaa',
  className = '',
  style,
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => startOfMonth(value ? parseISO(value) : new Date()))
  const rootRef = useRef(null)

  useEffect(() => {
    if (open) setMonth(startOfMonth(value ? parseISO(value) : min ? parseISO(min) : new Date()))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })
  const today = toIso(new Date())
  const isDisabledDay = (iso) => (min && iso < min) || (max && iso > max)
  const monthLabel = format(month, 'MMMM yyyy', { locale: es })

  const pick = (iso) => {
    onChange(iso)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} flex items-center justify-between text-left disabled:opacity-50 disabled:cursor-not-allowed`}
        style={style}
      >
        <span className={value ? '' : 'opacity-50'}>{value ? formatDateMx(value) : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Conserva la validación nativa de formularios (required) */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value || ''}
          onChange={() => {}}
          className="absolute bottom-0 left-1/2 h-px w-px opacity-0 pointer-events-none"
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Elegir fecha"
          className="absolute left-0 z-50 mt-2 w-72 rounded-lg border-2 bg-white p-3 shadow-lg font-body"
          style={{ borderColor: '#E5B3B0', color: '#374151' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setMonth(subMonths(month, 1))} className="rounded px-2 py-1 hover:bg-neutral-100" aria-label="Mes anterior">‹</button>
            <span className="font-medium capitalize">{monthLabel}</span>
            <button type="button" onClick={() => setMonth(addMonths(month, 1))} className="rounded px-2 py-1 hover:bg-neutral-100" aria-label="Mes siguiente">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs opacity-60 mb-1">
            {WEEK_DAYS.map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {days.map((d) => {
              const iso = toIso(d)
              const off = isDisabledDay(iso)
              const selected = iso === value
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={off}
                  onClick={() => pick(iso)}
                  aria-label={format(d, "d 'de' MMMM yyyy", { locale: es })}
                  aria-pressed={selected || undefined}
                  className={[
                    'h-8 rounded',
                    !isSameMonth(d, month) && 'opacity-40',
                    off ? 'opacity-25 cursor-not-allowed' : 'hover:bg-quaternary',
                    iso === today && !selected && 'border',
                    selected && 'text-white',
                  ].filter(Boolean).join(' ')}
                  style={selected ? { background: '#B73D37' } : iso === today ? { borderColor: '#B73D37' } : undefined}
                >
                  {format(d, 'd')}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="underline opacity-70">Borrar</button>
            {!isDisabledDay(today) && (
              <button type="button" onClick={() => pick(today)} className="underline" style={{ color: '#B73D37' }}>Hoy</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DateInput
