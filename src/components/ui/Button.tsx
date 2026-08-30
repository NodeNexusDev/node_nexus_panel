import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-accent-600 hover:bg-accent-500 text-white dark:bg-accent-500 dark:hover:bg-accent-400 shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/30',
  secondary: 'bg-surface-200 hover:bg-surface-300 text-surface-800 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-white shadow-sm',
  danger: 'bg-red-600 hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-400 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30',
  ghost: 'bg-transparent hover:bg-surface-100 text-surface-600 dark:hover:bg-surface-800 dark:text-surface-300',
  gradient: 'gradient-primary text-white shadow-md shadow-accent-500/25 hover:shadow-lg hover:shadow-accent-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed btn-press motion-reduce:transition-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
