import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  )
}

interface TableHeadProps {
  children: ReactNode
}

export function TableHead({ children }: TableHeadProps) {
  return (
    <thead>
      <tr className="border-b border-gray-800">{children}</tr>
    </thead>
  )
}

interface TableHeaderCellProps {
  children: ReactNode
  className?: string
}

export function TableHeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  )
}

interface TableBodyProps {
  children: ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-gray-800">{children}</tbody>
}

interface TableRowProps {
  children: ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={`hover:bg-gray-800/50 ${className}`}>{children}</tr>
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return <td className={`px-6 py-4 text-sm ${className}`}>{children}</td>
}
