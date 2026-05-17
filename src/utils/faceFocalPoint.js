/**
 * Focal point (%) for object-position from the largest detected face (BlazeFace).
 * Model + TF are loaded once; dynamic import keeps initial route bundle small.
 */

let modelPromise = null

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}

function asXY(pair) {
  if (!pair) return null
  if (Array.isArray(pair)) return { x: pair[0], y: pair[1] }
  return null
}

/**
 * @param {HTMLImageElement} img decoded image (naturalWidth > 0)
 * @returns {Promise<{ xPct: number, yPct: number } | null>}
 */
export async function getFaceObjectPositionPercent(img) {
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!w || !h) return null

  const [{ load }, tf] = await Promise.all([
    import('@tensorflow-models/blazeface'),
    import('@tensorflow/tfjs'),
  ])

  await tf.ready()

  if (!modelPromise) {
    modelPromise = load({ maxFaces: 6, scoreThreshold: 0.55 })
  }
  const model = await modelPromise

  const faces = await model.estimateFaces(img, false, false, false)
  if (!faces.length) return null

  let bestCx = 0
  let bestCy = 0
  let bestArea = 0

  for (const face of faces) {
    const tl = asXY(face.topLeft)
    const br = asXY(face.bottomRight)
    if (!tl || !br) continue
    const x0 = tl.x
    const y0 = tl.y
    const x1 = br.x
    const y1 = br.y
    const area = Math.max(0, x1 - x0) * Math.max(0, y1 - y0)
    if (area > bestArea) {
      bestArea = area
      bestCx = (x0 + x1) / 2
      bestCy = (y0 + y1) / 2
    }
  }

  if (bestArea <= 0) return null

  const xPct = clamp((bestCx / w) * 100, 10, 90)
  const yPct = clamp((bestCy / h) * 100, 10, 90)
  return { xPct, yPct }
}
