import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders with CardHeader and CardContent', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Test</Card>)
    expect(screen.getByText('Test').closest('div')).toHaveClass('custom-class')
  })
})
