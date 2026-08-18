import { http, HttpResponse } from 'msw'
import { mockContainers, mockImages, mockNetworks, mockVolumes } from '../data/docker'

const API = 'http://localhost:8000'

export const dockerHandlers = [
  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers`, () => {
    return HttpResponse.json(mockContainers)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers`, async ({ request }) => {
    const body = await request.json() as { name: string; image: string }
    const container = {
      id: Math.random().toString(36).slice(2),
      name: body.name,
      image: body.image,
      state: 'created' as const,
      status: 'created' as const,
      created: new Date().toISOString(),
      ports: [],
      labels: {},
    }
    return HttpResponse.json(container, { status: 201 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId`, ({ params }) => {
    const c = mockContainers.find((c) => c.id === params.containerId)
    if (!c) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(c)
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/start`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/stop`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/restart`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/exec`, async () => {
    return HttpResponse.json({ output: 'command executed successfully\n', exit_code: 0 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/logs`, () => {
    return HttpResponse.json({ logs: '2025-08-18 nginx started\n2025-08-18 listening on port 80\n', tail: 2 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/stats`, () => {
    return HttpResponse.json({ cpu_percent: 2.5, memory_usage_mb: 128, network_rx_bytes: 1024000, network_tx_bytes: 512000 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/images`, () => {
    return HttpResponse.json(mockImages)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/pull`, async ({ request }) => {
    const body = await request.json() as { image: string; tag?: string }
    const tag = body.tag ? `${body.image}:${body.tag}` : body.image
    return HttpResponse.json({ id: Math.random().toString(36).slice(2), tag, size_bytes: 100_000_000, created: new Date().toISOString(), labels: {} }, { status: 201 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/build`, async () => {
    return HttpResponse.json({ id: Math.random().toString(36).slice(2), tag: 'custom:latest', size_bytes: 50_000_000, created: new Date().toISOString(), labels: {} }, { status: 201 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId`, ({ params }) => {
    const img = mockImages.find((i) => i.id === params.imageId)
    if (!img) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(img)
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId/tag`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/networks`, () => {
    return HttpResponse.json(mockNetworks)
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/volumes`, () => {
    return HttpResponse.json(mockVolumes)
  }),

  http.post(`${API}/api/v1/docker/bulk/exec`, () => {
    return HttpResponse.json({ message: 'Bulk exec completed' })
  }),

  http.post(`${API}/api/v1/docker/bulk/restart`, () => {
    return HttpResponse.json({ message: 'Bulk restart completed' })
  }),

  http.post(`${API}/api/v1/docker/bulk/start`, () => {
    return HttpResponse.json({ message: 'Bulk start completed' })
  }),

  http.post(`${API}/api/v1/docker/bulk/stop`, () => {
    return HttpResponse.json({ message: 'Bulk stop completed' })
  }),
]
