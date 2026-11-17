/**
 * Fitune: plataforma de reservas, compras y cuentas de clientes a partir del 1 de diciembre de 2026.
 *
 * Desde ese momento popnest.app es un sitio informativo: los botones de "Reservar",
 * "Comprar" y "Mi cuenta" abren Fitune. Antes de la fecha todo funciona como siempre.
 * El cambio es automático (no requiere deploy), pero conviene volver a desplegar el
 * 1 de diciembre para que el HTML pre-renderizado (lo que ve Google) ya traiga los enlaces nuevos.
 *
 * Probar antes de la fecha: abre cualquier página con `?fitune=1` (se recuerda en esta pestaña;
 * `?fitune=0` lo apaga).
 */
import { useEffect, useState } from 'react'

export const FITUNE_BASE_URL = 'https://my.fitune.io/popnest-wellness'

/** Medianoche del 1 de diciembre en CDMX (UTC−06:00). */
export const FITUNE_CUTOVER_ISO = '2026-12-01T00:00:00-06:00'
const CUTOVER_MS = Date.parse(FITUNE_CUTOVER_ISO)

export const FITUNE_URLS = {
  schedule: `${FITUNE_BASE_URL}/activities`,
  pricing: `${FITUNE_BASE_URL}/pricing`,
  account: `${FITUNE_BASE_URL}/user/dashboard`,
  events: `${FITUNE_BASE_URL}/events`
}

/** Horario de Fitune abierto en un día concreto (YYYY-MM-DD). */
export function fituneScheduleUrl(date) {
  return date ? `${FITUNE_URLS.schedule}?date=${date}` : FITUNE_URLS.schedule
}

/**
 * Checkout directo de cada paquete en Fitune (ids de packageOffers.js → productId de Fitune).
 * Sin entrada → se abre la página de precios de Fitune.
 * TODO: agregar 'single-class' y 'paquete-popnest-duo' cuando existan en Fitune.
 */
const FITUNE_CHECKOUT = {
  'paquete-descubre-3': 'kind=pack&productId=59368',
  'paquete-ilimitado-mes': 'kind=membership&productId=59373',
  'paquete-4-clases': 'kind=pack&productId=59374',
  'paquete-8-clases': 'kind=pack&productId=59375',
  'package-10-classes': 'kind=pack&productId=59376',
  'paquete-12-clases': 'kind=pack&productId=59377',
  'package-20-classes': 'kind=pack&productId=59378'
}

export function fitunePackageUrl(packageId) {
  const query = FITUNE_CHECKOUT[packageId]
  return query ? `${FITUNE_BASE_URL}/checkout/complete_order?${query}` : FITUNE_URLS.pricing
}

/* global __POPNEST_BUILD_TIME__ */
const BUILD_TIME = typeof __POPNEST_BUILD_TIME__ === 'number' ? __POPNEST_BUILD_TIME__ : 0

/** ¿El build se generó ya después del corte? (mismo valor en prerender y en cliente → sin desajustes de hidratación). */
export const FITUNE_LIVE_AT_BUILD = BUILD_TIME >= CUTOVER_MS

const PREVIEW_KEY = 'pn_fitune_preview'

function readPreviewFlag() {
  if (typeof window === 'undefined') return false
  try {
    const param = new URLSearchParams(window.location.search).get('fitune')
    if (param === '1') sessionStorage.setItem(PREVIEW_KEY, '1')
    if (param === '0') sessionStorage.removeItem(PREVIEW_KEY)
    return sessionStorage.getItem(PREVIEW_KEY) === '1'
  } catch {
    return false
  }
}

/** Fuera de React (handlers, efectos): ¿ya reservamos en Fitune? */
export function isFituneLive() {
  if (FITUNE_LIVE_AT_BUILD) return true
  if (typeof window === 'undefined') return false
  return Date.now() >= CUTOVER_MS || readPreviewFlag()
}

/**
 * En componentes: arranca con el valor del build (igual que el HTML pre-renderizado)
 * y cambia a Fitune tras montar si la fecha ya pasó.
 */
export function useFituneLive() {
  const [live, setLive] = useState(FITUNE_LIVE_AT_BUILD)
  useEffect(() => {
    if (!live && isFituneLive()) setLive(true)
  }, [live])
  return live
}

/** Props para un <a> que abre Fitune (misma pestaña: en móvil las pestañas nuevas confunden). */
export const FITUNE_LINK_PROPS = { rel: 'noopener' }
