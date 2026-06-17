import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isBusy?: boolean
}

function Button({ children, isBusy = false, ...props }: ButtonProps) {
  return (
    <button className="auth-button" {...props}>
      {isBusy ? 'Trwa logowanie...' : children}
    </button>
  )
}

export default Button
