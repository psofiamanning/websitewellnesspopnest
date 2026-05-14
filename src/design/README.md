# Popnest Design System

Sistema de diseno boutique editorial para Estudio Popnest. Tono calido, presencia tipografica, minimo cromatico y mucho aire.

## Estructura En Este Proyecto

```text
src/
  styles/
    popnest.css
    tokens.css
    base.css
    components.css
  design/
    tokens.js
    README.md
  components/
    ui/
      Button.jsx
      Eyebrow.jsx
      Heading.jsx
      Input.jsx
      Logo.jsx
      PracticeDot.jsx
      index.js
```

## Activacion

El sistema esta cargado en el repo, pero no esta conectado al UI actual. Cuando estemos listos para aplicarlo, se puede importar desde `src/index.css`:

```css
@import './styles/popnest.css';
```

Ese archivo importa los estilos en el orden correcto:

```css
@import url('./tokens.css');
@import url('./base.css');
@import url('./components.css');
```

## Componentes React

Los componentes opcionales estan en `src/components/ui`:

```jsx
import { Button, Heading, Eyebrow, PracticeDot, Logo, Input } from '../components/ui'
```

## Principios

1. Minimo cromatico: cremas calidos como base, rojo terracota como acento.
2. Tipografia como protagonista: DM Sans para cuerpo e Instrument Serif italic para acentos.
3. Bordes finos, mucho aire: borders de `0.5px`, cards sin sombras.
4. Editorial sobre transaccional: headings grandes, eyebrows uppercase y ritmo de revista.
5. Dots de color para practicas: reemplazan iconos y mantienen consistencia visual.

## IDs De Practicas

| Practica | ID |
| --- | --- |
| Yoga | `yoga` |
| Pilates | `pilates` |
| Meditacion | `meditation` |
| Sound Healing | `sound` |
| Tai Chi | `taichi` |
