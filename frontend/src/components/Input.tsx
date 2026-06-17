import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

function Input({ label, id, ...props }: InputProps) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-field__label">{label}</span>
      <input className="auth-field__input" id={id} {...props} />
    </label>
  )
}

export default Input
