import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useInfiniteComposeProjects } from './useCompose'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions:{ queries:{ retry:false }}})
  return function Wrapper({children}:{children:ReactNode}){ return createElement(QueryClientProvider,{client:qc}, children)}
}

describe('useCompose', ()=>{
  it('fetches projects', async ()=>{
    const { result } = renderHook(()=> useInfiniteComposeProjects('1',{limit:20}), {wrapper:createWrapper()})
    await waitFor(()=> expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0]).toBeDefined()
  })
})
