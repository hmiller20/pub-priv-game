import * as React from "react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        ref={ref}
        className="w-4 h-4 accent-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-200"
        {...props}
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
)

Checkbox.displayName = "Checkbox" 