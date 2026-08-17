import { describe, it, expect, beforeEach } from 'vitest'
import { useConnectionStore } from './connection-store'

describe('connection-store', () => {
  beforeEach(() => {
    useConnectionStore.setState({ wsConnected: false })
  })

  it('has initial state disconnected', () => {
    expect(useConnectionStore.getState().wsConnected).toBe(false)
  })

  it('setWsConnected sets connected state', () => {
    useConnectionStore.getState().setWsConnected(true)
    expect(useConnectionStore.getState().wsConnected).toBe(true)
  })

  it('setWsConnected sets disconnected state', () => {
    useConnectionStore.getState().setWsConnected(true)
    useConnectionStore.getState().setWsConnected(false)
    expect(useConnectionStore.getState().wsConnected).toBe(false)
  })
})
