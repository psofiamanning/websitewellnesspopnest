import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'docs', 'diseno-estudio-popnest-wellness.pdf')

/** @typedef {{ type: 'title' | 'subtitle' | 'h2' | 'p' | 'gap', text?: string }} Block */

/** @type {Block[]} */
const blocks = [
  { type: 'title', text: 'Estudio Popnest Wellness' },
  { type: 'subtitle', text: 'Guía de diseño' },
  { type: 'gap' },
  {
    type: 'p',
    text:
      'Documento de referencia para compartir: marca, tipografía, colores y patrones de interfaz.',
  },
  { type: 'gap' },
  { type: 'h2', text: 'Stack técnico' },
  { type: 'p', text: 'React + Vite.' },
  { type: 'p', text: 'Tailwind CSS 3 (PostCSS + Autoprefixer).' },
  {
    type: 'p',
    text:
      'Estilos globales en src/index.css (Tailwind, base y utilidades). Estilos de marca y animaciones en src/App.css (fondos wellness, hero, galería, navbar).',
  },
  { type: 'p', text: 'Fuentes cargadas con Google Fonts (preconnect en index.html).' },
  { type: 'gap' },
  { type: 'h2', text: 'Paleta de color' },
  { type: 'p', text: 'primary #B73D37 — acento principal (terracota).' },
  { type: 'p', text: 'secondary #C76661 — variante.' },
  { type: 'p', text: 'tertiary #D48D88 — tonos medios.' },
  { type: 'p', text: 'quaternary #E5B3B0 — fondos suaves.' },
  { type: 'p', text: 'body #374151 — texto principal.' },
  { type: 'p', text: 'white #FFFFFF — fondos y texto sobre primarios.' },
  { type: 'p', text: 'grey-placeholder #B5AEAE — placeholders.' },
  { type: 'p', text: 'neutral #DED5D5 — neutros claros.' },
  { type: 'gap' },
  {
    type: 'p',
    text:
      'Accesibilidad: reglas en CSS para evitar texto blanco sobre fondo blanco; texto oscuro en fondos claros; texto blanco en botones primary y secondary.',
  },
  { type: 'gap' },
  { type: 'h2', text: 'Tipografía' },
  { type: 'p', text: 'Títulos: Hanken Grotesk (pesos 400, 600, 700).' },
  { type: 'p', text: 'Cuerpo: Epilogue (400).' },
  { type: 'p', text: 'En Tailwind: font-heading y font-body.' },
  {
    type: 'p',
    text:
      'Escala aproximada: h1/h4 ~40px, h2 ~30px, h3 ~26px, body 16px, interlineado ~1.4–1.6. Antialiasing en el cuerpo.',
  },
  { type: 'gap' },
  { type: 'h2', text: 'Patrones globales (index.css)' },
  { type: 'p', text: 'Animación fade-in (clase .animate-fade-in).' },
  { type: 'p', text: '.scrollbar-hide para carruseles horizontales.' },
  { type: 'p', text: 'Base HTML: safe area y scroll; #root y overflow pensados para navbar fijo.' },
  { type: 'p', text: 'Clase .logo: contención, hover suave, render nítido.' },
  { type: 'gap' },
  { type: 'h2', text: 'Estética wellness (App.css)' },
  {
    type: 'p',
    text:
      '.wellness-background: gradientes animados con tonos #f5f0ef y terracotas de la paleta.',
  },
  { type: 'p', text: 'Formas orgánicas difuminadas (.wellness-shapes) con animación pulse.' },
  { type: 'p', text: 'Decoración: hojas, mandalas, ondas, halos en el hero.' },
  { type: 'p', text: 'Entradas del hero: fadeInDown, fadeInUp, fadeInRight.' },
  {
    type: 'p',
    text:
      'Galería: .gallery-image y .studio-image (bordes redondeados, hover con sombra terracota).',
  },
  { type: 'gap' },
  { type: 'h2', text: 'Marca en redes' },
  { type: 'p', text: 'Imagen OG y Twitter: https://popnest.app/og-image.png' },
  { type: 'p', text: 'Idioma del sitio: es. Locale OG: es_MX.' },
  { type: 'gap' },
  { type: 'h2', text: 'Assets (referencia)' },
  { type: 'p', text: 'src/assets/: logo.svg, fotos de estudio, clases, instructoras, imágenes boutique.' },
  { type: 'p', text: 'public/: og-image.png para vistas previa al compartir el enlace.' },
  { type: 'gap' },
  { type: 'h2', text: 'Resumen' },
  {
    type: 'p',
    text:
      'Marca wellness con paleta terracota sobre neutros, tipografía Hanken Grotesk y Epilogue, interfaz con Tailwind y CSS a medida para fondos animados, hero y galería, con reglas de contraste en botones.',
  },
  { type: 'gap' },
  { type: 'p', text: 'Generado desde el repositorio Estudio Popnest Wellness.' },
]

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'Estudio Popnest Wellness — Guía de diseño',
    Author: 'Estudio Popnest Wellness',
  },
})

const stream = fs.createWriteStream(outPath)
doc.pipe(stream)

for (const block of blocks) {
  if (block.type === 'gap') {
    doc.moveDown(0.4)
    continue
  }
  if (block.type === 'title') {
    doc.font('Helvetica-Bold').fontSize(20).text(block.text ?? '', { continued: false })
    doc.moveDown(0.2)
    continue
  }
  if (block.type === 'subtitle') {
    doc.font('Helvetica').fontSize(12).fillColor('#555555').text(block.text ?? '')
    doc.fillColor('#000000')
    doc.moveDown(0.8)
    continue
  }
  if (block.type === 'h2') {
    doc.moveDown(0.3)
    doc.font('Helvetica-Bold').fontSize(12).text(block.text ?? '')
    doc.moveDown(0.25)
    continue
  }
  doc.font('Helvetica').fontSize(10).text(block.text ?? '', { align: 'left', lineGap: 2 })
  doc.moveDown(0.15)
}

doc.end()

await new Promise((resolve, reject) => {
  stream.on('finish', resolve)
  stream.on('error', reject)
})

console.log('PDF written to:', outPath)
