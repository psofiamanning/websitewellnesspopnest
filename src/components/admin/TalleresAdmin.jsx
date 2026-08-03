import { useEffect, useState } from 'react'
import {
  adminListTalleres,
  adminCreateTaller,
  adminUpdateTaller,
  adminDeleteTaller,
  adminUploadTallerImage,
  adminGenerateTallerAI,
  adminGeneratePaymentLink,
} from '../../services/talleresService'

const EMPTY = {
  title: '',
  tema: '',
  descripcion: '',
  comida: '',
  price: '',
  image_url: '',
  fecha: '',
  hora: '',
  lugar: '',
  spots_total: 20,
  is_active: true,
  payment_link: '',
}

const fieldStyle = { borderColor: '#DED5D5' }

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function TalleresAdmin() {
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // objeto en edición o null
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [pmLoading, setPmLoading] = useState(false)
  const [pmError, setPmError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setTalleres(await adminListTalleres())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing('new')
    setForm(EMPTY)
    setFormError('')
    setAiPrompt('')
    setAiError('')
  }

  const openEdit = (t) => {
    setEditing(t.id)
    setForm({
      title: t.title || '',
      tema: t.tema || '',
      descripcion: t.descripcion || '',
      comida: t.comida || '',
      price: t.price ?? '',
      image_url: t.image_url || '',
      fecha: t.fecha || '',
      hora: t.hora || '',
      lugar: t.lugar || '',
      spots_total: t.spots_total ?? 20,
      is_active: !!t.is_active,
      payment_link: t.payment_link || '',
    })
    setFormError('')
    setAiPrompt('')
    setAiError('')
  }

  const closeForm = () => {
    setEditing(null)
    setForm(EMPTY)
    setFormError('')
    setAiPrompt('')
    setAiError('')
  }

  const generatePaymentLink = async () => {
    if (!Number(form.price) || Number(form.price) <= 0) {
      setPmError('Pon un precio mayor a 0 antes de generar el link.')
      return
    }
    setPmLoading(true)
    setPmError('')
    try {
      const url = await adminGeneratePaymentLink(form.title || 'Taller — Estudio Popnest', form.price)
      setField('payment_link', url)
    } catch (e) {
      setPmError(e.message)
    } finally {
      setPmLoading(false)
    }
  }

  const runAi = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Escribe qué taller quieres o qué cambio hacer.')
      return
    }
    setAiLoading(true)
    setAiError('')
    try {
      // Al editar, mandamos el taller actual como contexto para aplicar cambios.
      const current = editing === 'new' ? null : form
      const result = await adminGenerateTallerAI(aiPrompt, current)
      setForm((prev) => ({ ...prev, ...result }))
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  const setField = (k, v) => {
    setFormError('')
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 12 * 1024 * 1024) {
      setFormError('La imagen es muy grande (máx. 12 MB).')
      return
    }
    setUploading(true)
    setFormError('')
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const url = await adminUploadTallerImage(dataUrl, file.name)
      setField('image_url', url)
    } catch (err) {
      setFormError('No se pudo subir la imagen: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.title.trim()) {
      setFormError('El título es obligatorio.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = { ...form, price: Number(form.price) || 0, spots_total: parseInt(form.spots_total, 10) || 0 }
      if (editing === 'new') {
        await adminCreateTaller(payload)
      } else {
        await adminUpdateTaller(editing, payload)
      }
      closeForm()
      await load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (t) => {
    if (!window.confirm(`¿Borrar el taller "${t.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminDeleteTaller(t.id)
      await load()
    } catch (e) {
      alert('No se pudo borrar: ' + e.message)
    }
  }

  const toggleActive = async (t) => {
    try {
      await adminUpdateTaller(t.id, { is_active: !t.is_active })
      await load()
    } catch (e) {
      alert('No se pudo actualizar: ' + e.message)
    }
  }

  const inputCls = 'w-full rounded-lg border-2 px-3 py-2 font-body text-sm'

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold" style={{ color: '#1F2937' }}>Talleres</h2>
          <p className="text-sm font-body" style={{ color: '#6B7280' }}>
            Crea y edita los talleres que aparecen en la web. Los cambios se ven al instante.
          </p>
        </div>
        <button onClick={openNew} className="rounded-lg px-4 py-2 text-sm font-body font-semibold text-white" style={{ backgroundColor: '#B73D37' }}>
          + Nuevo taller
        </button>
      </div>

      {error && <p className="mb-4 font-body text-sm" style={{ color: '#B73D37' }}>{error}</p>}
      {loading && <p className="font-body text-sm" style={{ color: '#6B7280' }}>Cargando…</p>}

      {!loading && talleres.length === 0 && (
        <p className="font-body text-sm" style={{ color: '#6B7280' }}>Aún no hay talleres. Crea el primero con “Nuevo taller”.</p>
      )}

      {!loading && talleres.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talleres.map((t) => {
            const sold = Math.max(0, (t.spots_total || 0) - (t.spots_available || 0))
            return (
              <div key={t.id} className="flex gap-4 rounded-xl border-2 bg-white p-4" style={{ borderColor: '#E5B3B0' }}>
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: '#F2E9E4' }}>
                  {t.image_url && <img src={t.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-heading font-bold" style={{ color: '#1F2937' }}>{t.title}</h3>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-body font-semibold" style={{ backgroundColor: t.is_active ? '#DCFCE7' : '#F3F4F6', color: t.is_active ? '#166534' : '#6B7280' }}>
                      {t.is_active ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-body" style={{ color: '#6B7280' }}>
                    {t.tema ? `${t.tema} · ` : ''}{Number(t.price) > 0 ? `$${Number(t.price).toLocaleString('es-MX')} MXN` : 'Gratis'}
                    {t.fecha ? ` · ${t.fecha}${t.hora ? ' ' + t.hora : ''}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs font-body" style={{ color: '#9CA3AF' }}>
                    {sold} vendidos · {t.spots_available}/{t.spots_total} disponibles
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-body font-semibold">
                    <button onClick={() => openEdit(t)} style={{ color: '#B73D37' }}>Editar</button>
                    <button onClick={() => toggleActive(t)} style={{ color: '#6B7280' }}>{t.is_active ? 'Despublicar' : 'Publicar'}</button>
                    <button onClick={() => remove(t)} style={{ color: '#B91C1C' }}>Borrar</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal formulario */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={closeForm}>
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-heading font-bold" style={{ color: '#1F2937' }}>
              {editing === 'new' ? 'Nuevo taller' : 'Editar taller'}
            </h3>

            {/* Editor con lenguaje natural (IA) */}
            <div className="mb-5 rounded-xl border-2 p-4" style={{ borderColor: '#E5B3B0', backgroundColor: '#FDF6F5' }}>
              <label className="mb-1 flex items-center gap-2 text-sm font-body font-semibold" style={{ color: '#B73D37' }}>
                ✨ Escríbelo en lenguaje natural
              </label>
              <p className="mb-2 text-xs font-body" style={{ color: '#6B7280' }}>
                {editing === 'new'
                  ? 'Describe el taller y la IA llena los campos. Ej: "Taller de cacao y respiración el 15 de septiembre a las 6pm, $650, incluye brunch vegano".'
                  : 'Describe el cambio y la IA actualiza los campos. Ej: "Cambia el precio a 500 y la comida a té e infusiones".'}
              </p>
              <textarea
                rows={2}
                className="w-full rounded-lg border-2 px-3 py-2 font-body text-sm"
                style={fieldStyle}
                value={aiPrompt}
                onChange={(e) => { setAiPrompt(e.target.value); setAiError('') }}
                placeholder="Escribe aquí…"
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={runAi}
                  disabled={aiLoading}
                  className="rounded-lg px-4 py-2 text-sm font-body font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#B73D37' }}
                >
                  {aiLoading ? 'Generando…' : editing === 'new' ? 'Generar con IA' : 'Aplicar cambio con IA'}
                </button>
                <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>Revisa los campos antes de guardar.</span>
              </div>
              {aiError && <p className="mt-2 text-sm font-body" style={{ color: '#B73D37' }}>{aiError}</p>}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Título *</label>
                <input className={inputCls} style={fieldStyle} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Taller de..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Tema</label>
                  <input className={inputCls} style={fieldStyle} value={form.tema} onChange={(e) => setField('tema', e.target.value)} placeholder="Ej. Cacao & respiración" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Comida</label>
                  <input className={inputCls} style={fieldStyle} value={form.comida} onChange={(e) => setField('comida', e.target.value)} placeholder="Ej. Brunch vegano incluido" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Descripción</label>
                <textarea rows={3} className={inputCls} style={fieldStyle} value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} placeholder="Describe la experiencia…" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Precio (MXN)</label>
                  <input type="number" min="0" className={inputCls} style={fieldStyle} value={form.price} onChange={(e) => setField('price', e.target.value)} placeholder="0 = gratis" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Cupo</label>
                  <input type="number" min="0" className={inputCls} style={fieldStyle} value={form.spots_total} onChange={(e) => setField('spots_total', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Fecha</label>
                  <input type="date" className={inputCls} style={fieldStyle} value={form.fecha} onChange={(e) => setField('fecha', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Hora</label>
                  <input className={inputCls} style={fieldStyle} value={form.hora} onChange={(e) => setField('hora', e.target.value)} placeholder="10:00" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Lugar</label>
                <input className={inputCls} style={fieldStyle} value={form.lugar} onChange={(e) => setField('lugar', e.target.value)} placeholder="Estudio Popnest Wellness, Coyoacán" />
              </div>

              <div className="rounded-lg border-2 p-3" style={{ borderColor: '#E5B3B0', backgroundColor: '#FDF6F5' }}>
                <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#B73D37' }}>💳 Link de pago (Stripe)</label>
                <input
                  className={inputCls}
                  style={fieldStyle}
                  value={form.payment_link}
                  onChange={(e) => { setField('payment_link', e.target.value); setPmError('') }}
                  placeholder="https://buy.stripe.com/…"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={generatePaymentLink}
                    disabled={pmLoading}
                    className="rounded-lg border-2 px-3 py-1.5 text-xs font-body font-semibold disabled:opacity-50"
                    style={{ borderColor: '#B73D37', color: '#B73D37' }}
                  >
                    {pmLoading ? 'Generando…' : 'Generar link con Stripe'}
                  </button>
                  <span className="text-xs font-body" style={{ color: '#9CA3AF' }}>
                    Con link, el botón “Reservar” abre el checkout de Stripe. Vacío = pago con tarjeta en el sitio.
                  </span>
                </div>
                {pmError && <p className="mt-2 text-xs font-body" style={{ color: '#B73D37' }}>{pmError}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-body font-semibold" style={{ color: '#6B7280' }}>Imagen</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: '#F2E9E4' }}>
                    {form.image_url && <img src={form.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <label className="cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-body font-semibold" style={{ borderColor: '#B73D37', color: '#B73D37' }}>
                    {uploading ? 'Subiendo…' : 'Subir imagen'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
                <span className="text-sm font-body" style={{ color: '#4B5563' }}>Publicado (visible en la web)</span>
              </label>

              {formError && <p className="text-sm font-body" style={{ color: '#B73D37' }}>{formError}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeForm} className="rounded-lg px-4 py-2 text-sm font-body font-semibold" style={{ color: '#6B7280' }}>Cancelar</button>
              <button onClick={save} disabled={saving || uploading} className="rounded-lg px-5 py-2 text-sm font-body font-semibold text-white disabled:opacity-50" style={{ backgroundColor: '#B73D37' }}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
