// Campo trampa para bots: invisible para las personas (y fuera del orden de tabulación),
// pero los bots que llenan todos los inputs lo completan y el servidor los descarta.
function AuthHoneypot({ value, onChange }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label htmlFor="popnest_hp">No llenes este campo</label>
      <input
        type="text"
        id="popnest_hp"
        name="popnest_hp"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default AuthHoneypot
