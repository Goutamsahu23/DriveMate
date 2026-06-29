import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) {
  return (
    <div className={className}>
      {label && <label className="label-field">{label}</label>}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-dim group-focus-within:text-volt transition-colors duration-300 w-4 h-4" />
        )}
        <input
          ref={ref}
          className={`input-field ${Icon ? 'pl-11' : ''} ${error ? 'border-coral/50 focus:border-coral/50 focus:ring-coral/10' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-coral text-xs mt-1.5 font-mono">{error}</p>
      )}
    </div>
  )
})

export default Input
