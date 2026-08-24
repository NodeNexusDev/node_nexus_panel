import { http, HttpResponse } from 'msw'
import { mockContainers, mockImages, mockNetworks, mockVolumes } from '../data/docker'

const API = '*'

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
    mockContainers.push(container)
    return HttpResponse.json({ id: container.ID, name: container.Names, image: container.Image, status: container.State }, { status: 201 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (!c) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ Id: c.ID, Name: c.Names, State: { status: c.State, running: c.State === 'running', exit_code: 0 }, Config: { image: c.Image } })
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId`, ({ params }) => {
    const idx = mockContainers.findIndex((c) => c.ID === params.containerId)
    if (idx !== -1) mockContainers.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/start`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) { c.State = 'running'; c.Status = 'Up less than a second' }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/stop`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) { c.State = 'exited'; c.Status = 'Exited (0) less than a second ago' }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/restart`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) { c.Status = 'Up less than a second' }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/pause`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) { c.State = 'paused'; c.Status = 'Paused' }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/unpause`, ({ params }) => {
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) { c.State = 'running'; c.Status = 'Up less than a second' }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/rename`, async ({ params, request }) => {
    const body = await request.json() as { new_name: string }
    const c = mockContainers.find((c) => c.ID === params.containerId)
    if (c) c.Names = `/${body.new_name}`
    return HttpResponse.json({ message: `Container renamed to ${body.new_name}` })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/containers/prune`, () => {
    return HttpResponse.json({ containers_deleted: [], space_reclaimed: '0B' })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/containers/:containerId/top`, () => {
    return HttpResponse.json({
      titles: ['PID', 'USER', 'TIME', 'COMMAND'],
      processes: [['1', 'root', '0:00', 'nginx: master process nginx']],
    })
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

  http.post(`${API}/api/v1/nodes/:nodeId/docker/images/prune`, () => {
    return HttpResponse.json({ images_deleted: [], space_reclaimed: '0B' })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/networks`, () => {
    return HttpResponse.json(mockNetworks)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/networks`, async ({ request }) => {
    const body = await request.json() as { name: string; driver?: string }
    const network = {
      ID: Math.random().toString(36).slice(2),
      Name: body.name,
      Driver: body.driver || 'bridge',
      Scope: 'local',
    }
    mockNetworks.push(network)
    return HttpResponse.json(network, { status: 201 })
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/networks/:networkId`, ({ params }) => {
    const idx = mockNetworks.findIndex((n) => n.ID === params.networkId)
    if (idx !== -1) mockNetworks.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/networks/:networkId`, ({ params }) => {
    const net = mockNetworks.find((n) => n.ID === params.networkId)
    if (!net) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      id: net.ID,
      name: net.Name,
      driver: net.Driver,
      scope: net.Scope,
      containers: [],
    })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/networks/:networkId/connect`, async () => {
    return HttpResponse.json({ message: 'Container connected to network' })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/networks/:networkId/disconnect`, async () => {
    return HttpResponse.json({ message: 'Container disconnected from network' })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/volumes`, () => {
    return HttpResponse.json(mockVolumes)
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/volumes`, async ({ request }) => {
    const body = await request.json() as { name?: string; driver?: string }
    const volume = {
      Name: body.name || 'new-volume',
      Driver: body.driver || 'local',
    }
    mockVolumes.push(volume)
    return HttpResponse.json(volume, { status: 201 })
  }),

  http.delete(`${API}/api/v1/nodes/:nodeId/docker/volumes/:volumeName`, ({ params }) => {
    const idx = mockVolumes.findIndex((v) => v.Name === params.volumeName)
    if (idx !== -1) mockVolumes.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/volumes/:volumeName`, ({ params }) => {
    const vol = mockVolumes.find((v) => v.Name === params.volumeName)
    if (!vol) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      name: vol.Name,
      driver: vol.Driver,
      mountpoint: `/var/lib/docker/volumes/${vol.Name}/_data`,
      labels: {},
    })
  }),

  http.post(`${API}/api/v1/nodes/:nodeId/docker/volumes/prune`, () => {
    return HttpResponse.json({ volumes_deleted: [], space_reclaimed: '0B' })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/system/info`, () => {
    return HttpResponse.json({
      server_version: '24.0.7',
      operating_system: 'Docker Desktop',
      architecture: 'x86_64',
      cpus: 8,
      total_memory: '16GiB',
      storage_driver: 'overlay2',
      containers_running: 5,
      containers_stopped: 2,
      images: 12,
    })
  }),

  http.get(`${API}/api/v1/nodes/:nodeId/docker/system/df`, () => {
    return HttpResponse.json([
      { type: 'Images', total_count: 12, active_size: '2.5GB', reclaimable_size: '1.2GB', reclaimable_percent: '48%' },
      { type: 'Containers', total_count: 7, active_size: '100MB', reclaimable_size: '50MB', reclaimable_percent: '50%' },
      { type: 'Volumes', total_count: 5, active_size: '500MB', reclaimable_size: '100MB', reclaimable_percent: '20%' },
    ])
  }),

  http.post(`${API}/api/v1/docker/bulk/exec`, async ({ request }) => {
    const body = await request.json() as { node_ids?: string[]; node_tags?: string[]; command?: string }
    const nodeIds = body.node_ids || ['1', '2']
    return HttpResponse.json({
      action: 'exec',
      results: nodeIds.map((nid) => ({ node_id: nid, node_name: `node-${nid}`, status: 'success', output: 'command executed successfully\n', error: '' })),
      total: nodeIds.length,
      succeeded: nodeIds.length,
      failed: 0,
    })
  }),

  http.post(`${API}/api/v1/docker/bulk/restart`, async ({ request }) => {
    const body = await request.json() as { node_ids?: string[]; node_tags?: string[] }
    const nodeIds = body.node_ids || ['1', '2']
    return HttpResponse.json({
      action: 'restart',
      results: nodeIds.map((nid) => ({ node_id: nid, node_name: `node-${nid}`, status: 'success', output: '', error: '' })),
      total: nodeIds.length,
      succeeded: nodeIds.length,
      failed: 0,
    })
  }),

  http.post(`${API}/api/v1/docker/bulk/start`, async ({ request }) => {
    const body = await request.json() as { node_ids?: string[]; node_tags?: string[] }
    const nodeIds = body.node_ids || ['1', '2']
    return HttpResponse.json({
      action: 'start',
      results: nodeIds.map((nid) => ({ node_id: nid, node_name: `node-${nid}`, status: 'success', output: '', error: '' })),
      total: nodeIds.length,
      succeeded: nodeIds.length,
      failed: 0,
    })
  }),

  http.post(`${API}/api/v1/docker/bulk/stop`, async ({ request }) => {
    const body = await request.json() as { node_ids?: string[]; node_tags?: string[] }
    const nodeIds = body.node_ids || ['1', '2']
    return HttpResponse.json({
      action: 'stop',
      results: nodeIds.map((nid) => ({ node_id: nid, node_name: `node-${nid}`, status: 'success', output: '', error: '' })),
      total: nodeIds.length,
      succeeded: nodeIds.length,
      failed: 0,
    })
  }),
]
