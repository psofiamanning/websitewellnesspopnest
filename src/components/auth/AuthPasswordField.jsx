import { useState } from 'react'

function AuthPasswordField({
  id,
  name,
  label,
  value,
  onChange,
  required = true,
  minLength,
  hint,
  headExtra,
  placeholder,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      {headExtra ? (
        <div className="auth-field__head">
          <label htmlFor={id}>{label}</label>
          {headExtra}
        </div>
      ) : (
        <label htmlFor={id}>{label}</label>
      )}
      <div className="auth-password-wrap">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          autoComplete={name === 'password' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {hint ? <span className="auth-hint">{hint}</span> : null}
    </div>
  )
}

export default AuthPasswordField
