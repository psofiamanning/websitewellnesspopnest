import { useEffect, useRef, useState } from 'react'

/**
 * After load, runs BlazeFace once and sets object-position (and transform-origin)
 * to the largest face when objectFit is cover. With contain, skips detection (full image).
 */
export function FaceAwareImage({
  src,
  alt = '',
  className,
  style,
  loading,
  decoding,
  objectFit = 'cover',
  /** Force face detection on/off; default off when objectFit is contain */
  detectFace,
  /** CSS object-position when detection fails or is pending */
  defaultObjectPosition = '50% 82%',
  ...rest
}) {
  const ref = useRef(null)
  const [focal, setFocal] = useState(null)
  const runFace = detectFace ?? objectFit !== 'contain'

  useEffect(() => {
    let cancelled = false
    const img = ref.current
    if (!img || !src || !runFace) return

    const waitDecode = () =>
      new Promise((resolve) => {
        if (img.decode) {
          img.decode().then(resolve).catch(resolve)
        } else {
          resolve()
        }
      })

    const run = async () => {
      setFocal(null)
      try {
        if (!img.complete) {
          await new Promise((resolve, reject) => {
            const ok = () => {
              img.removeEventListener('load', ok)
              img.removeEventListener('error', bad)
              resolve()
            }
            const bad = () => {
              img.removeEventListener('load', ok)
              img.removeEventListener('error', bad)
              reject(new Error('image load error'))
            }
            img.addEventListener('load', ok)
            img.addEventListener('error', bad)
          })
        }
        await waitDecode()
        if (cancelled || img.naturalWidth === 0) return

        const { getFaceObjectPositionPercent } = await import('../utils/faceFocalPoint')
        const p = await getFaceObjectPositionPercent(img)
        if (cancelled || !p) return
        const pos = `${p.xPct}% ${p.yPct}%`
        setFocal(pos)
      } catch {
        /* fallback: defaultObjectPosition */
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [src, runFace])

  const pos = runFace ? focal ?? defaultObjectPosition : '50% 50%'

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      style={{
        ...style,
        objectFit,
        objectPosition: pos,
        transformOrigin: pos,
      }}
      {...rest}
    />
  )
}
