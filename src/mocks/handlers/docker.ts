import { http, HttpResponse } from 'msw'
import { mockContainers, mockImages, mockNetworks, mockVolumes } from '../data/docker'

const API = 'http://localhost:8000'

export const dockerHandlers = [
  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers`, () => {
    return HttpResponse.json(mockContainers)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers`, async ({ request }) => {
    const body = await request.json() as { image: string; name?: string }
    const container = {
      ID: Math.random().toString(36).slice(2),
      Names: `/${body.name || 'new-container'}`,
      Image: body.image,
      Command: '',
      CreatedAt: new Date().toISOString(),
      State: 'created',
      Status: 'Created',
      Ports: null,
      Networks: null,
    }
    return HttpResponse.json({ id: container.ID, name: container.Names, image: container.Image, status: container.State }, { status: 201 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (!c) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ Id: c.ID, Name: c.Names, State: { status: c.State, running: c.State === 'running', exit_code: 0 }, Config: { image: c.Image } })
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
    return HttpResponse.json({ stdout: 'command executed successfully\n', stderr: '', exit_code: 0 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/logs`, () => {
    return HttpResponse.json('2025-08-18 nginx started\n2025-08-18 listening on port 80\n')
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/stats`, () => {
    return HttpResponse.json({ Container: 'c1', Name: 'nginx', CPUPerc: '2.50%', MemUsage: '128MiB / 1GiB', MemPerc: '12.50%', NetIO: '1MB / 512KB', BlockIO: '10MB / 0B', MemLimit: '1GiB', PIDs: '5' })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/images`, () => {
    return HttpResponse.json(mockImages)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/pull`, async ({ request }) => {
    const body = await request.json() as { image: string; timeout?: number }
    return HttpResponse.json({ image: body.image, output: `Pulling ${body.image}...\nDone`, success: true }, { status: 200 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/build`, async () => {
    return HttpResponse.json({ image_id: 'sha256:build123', tag: 'custom:latest', output: 'Building...\nDone' }, { status: 200 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId`, ({ params }) => {
    const img = mockImages.find((i) => i.ID === params.imageId)
    if (!img) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ id: img.ID, repo_tags: [`${img.Repository}:${img.Tag}`], size: 100000000 })
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/:imageId/tag`, async ({ request }) => {
    const body = await request.json() as { repo: string; tag: string }
    return HttpResponse.json({ source: 'old', target: `${body.repo}:${body.tag}` })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/networks`, () => {
    return HttpResponse.json(mockNetworks)
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/volumes`, () => {
    return HttpResponse.json(mockVolumes)
  }),

  http.post(`${API}/api/v1/docker/bulk/exec`, () => {
    return HttpResponse.json({ affected: 1, batch_id: 'bulk-1' })
  }),

  http.post(`${API}/api/v1/docker/bulk/restart`, () => {
    return HttpResponse.json({ affected: 1, batch_id: 'bulk-2' })
  }),

  http.post(`${API}/api/v1/docker/bulk/start`, () => {
    return HttpResponse.json({ affected: 1, batch_id: 'bulk-3' })
  }),

  http.post(`${API}/api/v1/docker/bulk/stop`, () => {
    return HttpResponse.json({ affected: 1, batch_id: 'bulk-4' })
  }),
]
