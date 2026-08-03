// Editor de talleres con lenguaje natural (Claude / Anthropic API).
// Convierte una descripción o instrucción en español en los campos
// estructurados de un taller. Modo crear (sin `current`) o editar (con `current`).
import Anthropic from '@anthropic-ai/sdk'

// Modelo por defecto: Claude Opus 5. Se puede cambiar con TALLERES_AI_MODEL
// (p. ej. `claude-haiku-4-5` para menor costo/latencia).
const MODEL = (process.env.TALLERES_AI_MODEL || 'claude-opus-5').trim()

// Esquema de salida estructurada: garantiza JSON válido con estos campos.
const TALLER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', description: 'Título del taller' },
    tema: { type: 'string', description: 'Tema o subtítulo corto; "" si no aplica' },
    descripcion: { type: 'string', description: 'Descripción atractiva de 2 a 4 oraciones' },
    comida: { type: 'string', description: 'Comida/bebida incluida; "" si no se menciona' },
    price: { type: 'number', description: 'Precio en MXN; 0 si es gratis' },
    fecha: { type: 'string', description: 'Fecha YYYY-MM-DD; "" si no se menciona' },
    hora: { type: 'string', description: 'Hora HH:MM en 24h; "" si no se menciona' },
    lugar: { type: 'string', description: 'Lugar del taller' },
    spots_total: { type: 'integer', description: 'Cupo total; 20 si no se menciona' },
    is_active: { type: 'boolean', description: 'true para publicar; false para borrador' },
  },
  required: [
    'title', 'tema', 'descripcion', 'comida', 'price',
    'fecha', 'hora', 'lugar', 'spots_total', 'is_active',
  ],
}

export function isTalleresAiConfigured() {
  return !!(process.env.ANTHROPIC_API_KEY || '').trim()
}

function buildSystemPrompt(today) {
  return `Eres un asistente que crea y edita "talleres" (experiencias de bienestar) para Estudio Popnest Wellness, un estudio boutique en Del Carmen, Coyoacán, CDMX. Conviertes descripciones en lenguaje natural (en español) en los campos estructurados de un taller.

Reglas:
- La fecha de hoy es ${today}. Resuelve fechas relativas ("este viernes", "8 de agosto") a una fecha absoluta FUTURA en formato YYYY-MM-DD. Si no se menciona fecha, deja "".
- hora en formato de 24 horas HH:MM (ej. "6 pm" -> "18:00"). Si no se menciona, deja "".
- price en pesos mexicanos (número entero o decimal). "gratis" -> 0.
- spots_total: si no se menciona, usa 20.
- lugar: si no se menciona, usa "Estudio Popnest Wellness, Londres 105, Del Carmen, Coyoacán".
- descripcion: redáctala clara y atractiva (2 a 4 oraciones), tono cálido y de bienestar. NO inventes datos concretos (precios, fechas, nombres) que el usuario no haya dado.
- comida: solo si se menciona; si no, "".
- is_active: true salvo que el usuario pida dejarlo como borrador o "no publicar".
- Responde ÚNICAMENTE con el objeto JSON de los campos, sin texto adicional.`
}

/**
 * @param {{instruction: string, current?: object|null, today: string}} params
 * @returns {Promise<object>} campos del taller
 */
export async function generateTallerFromPrompt({ instruction, current = null, today }) {
  if (!isTalleresAiConfigured()) {
    throw new Error('El editor con IA no está configurado: falta ANTHROPIC_API_KEY en el servidor.')
  }
  if (!instruction || !String(instruction).trim()) {
    throw new Error('Escribe una descripción o instrucción para la IA.')
  }

  const client = new Anthropic() // lee ANTHROPIC_API_KEY del entorno

  const userText = current
    ? `Taller actual (JSON):\n${JSON.stringify(current)}\n\nInstrucción de cambio del usuario: ${instruction}\n\nDevuelve el taller COMPLETO ya actualizado (todos los campos).`
    : `Descripción del nuevo taller (del usuario): ${instruction}\n\nDevuelve los campos del taller.`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema: TALLER_SCHEMA } },
    system: buildSystemPrompt(today),
    messages: [{ role: 'user', content: userText }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('La IA no pudo procesar esta solicitud. Reformula la descripción.')
  }

  const textBlock = (response.content || []).find((b) => b.type === 'text')
  if (!textBlock || !textBlock.text) {
    throw new Error('La IA no devolvió una respuesta válida.')
  }

  let data
  try {
    data = JSON.parse(textBlock.text)
  } catch (_e) {
    // Por si el modelo envolviera el JSON en texto: intenta extraer el objeto.
    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No se pudo interpretar la respuesta de la IA.')
    data = JSON.parse(match[0])
  }
  return data
}
