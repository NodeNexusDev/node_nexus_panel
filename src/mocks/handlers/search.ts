import { http, HttpResponse } from 'msw'
import { getSearchResults } from '../data/favorites'

const API = 'http://localhost:8000'

export const searchHandlers = [
  http.get(`${API}/api/v1/search`, ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const results = getSearchResults(q)
    return HttpResponse.json(results)
  }),
]
