import logo from '../assets/logo.svg'

function Logo({ 
  className = '', 
  style = {},
  height = '50px',
  width = 'auto',
  variant = 'primary' // 'primary', 'white', o 'red-bg'
}) {
  // Para el footer con fondo rojo, si el logo ya tiene fondo rojo y letras blancas,
  // no necesitamos filtrar. Si es el logo primario, lo invertimos a blanco.
  const getFilter = () => {
    if (variant === 'white') {
      // Si el logo original tiene fondo rojo y letras blancas, no necesitamos filtrar
      // Si el logo original tiene fondo blanco/transparente y letras rojas, invertimos
      return 'brightness(0) invert(1)'
    }
    if (variant === 'red-bg') {
      // Logo con fondo rojo - sin filtro
      return 'none'
    }
    return 'none'
  }

  return (
    <img 
      src={logo} 
      alt="Estudio Popnest Wellness" 
      className={`logo ${className}`}
      style={{
        height: height,
        width: width || 'auto',
        display: 'block',
        objectFit: 'contain',
        maxWidth: '100%',
        filter: getFilter(),
        ...style
      }}
      onError={(e) => {
        console.error('Error loading logo:', e)
        e.target.style.display = 'none'
      }}
    />
  )
}

export default Logo
