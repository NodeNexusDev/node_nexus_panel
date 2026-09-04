import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/render-with-providers'
import { Templates } from './Templates'

describe('Templates', ()=>{
  it('renders packs and registries tabs', async ()=>{
    renderWithProviders(<Templates />)
    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Packs')).toBeInTheDocument()
    expect(screen.getByText('Registries')).toBeInTheDocument()
  })
})
