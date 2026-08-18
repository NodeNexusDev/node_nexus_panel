import type { DockerContainer, DockerImage, DockerNetwork, DockerVolume } from '../../api/types'

export const mockContainers: DockerContainer[] = [
  {
    ID: 'c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    Names: '/nginx-proxy',
    Image: 'nginx:1.25-alpine',
    Command: 'nginx -g "daemon off;"',
    CreatedAt: '2025-08-10T14:30:00Z',
    State: 'running',
    Status: 'Up 8 days',
    Ports: '0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp',
    Networks: 'bridge, web_default',
  },
  {
    ID: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    Names: '/postgres-main',
    Image: 'postgres:16-alpine',
    Command: 'docker-entrypoint.sh postgres',
    CreatedAt: '2025-07-20T10:00:00Z',
    State: 'running',
    Status: 'Up 30 days',
    Ports: '0.0.0.0:5432->5432/tcp',
    Networks: 'bridge',
  },
  {
    ID: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    Names: '/redis-cache',
    Image: 'redis:7-alpine',
    Command: 'redis-server',
    CreatedAt: '2025-08-01T08:15:00Z',
    State: 'exited',
    Status: 'Exited (0) 2 days ago',
    Ports: '0.0.0.0:6379->6379/tcp',
    Networks: 'bridge',
  },
  {
    ID: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    Names: '/app-worker',
    Image: 'node:20-alpine',
    Command: 'node worker.js',
    CreatedAt: '2025-08-15T12:00:00Z',
    State: 'running',
    Status: 'Up 3 days',
    Ports: null,
    Networks: 'bridge, web_default',
  },
]

export const mockImages: DockerImage[] = [
  { Repository: 'nginx', Tag: '1.25-alpine', ID: 'sha256:1234567890abcdef', Size: '42 MB', CreatedAt: '2025-07-15T00:00:00Z' },
  { Repository: 'postgres', Tag: '16-alpine', ID: 'sha256:abcdef1234567890', Size: '280 MB', CreatedAt: '2025-06-01T00:00:00Z' },
  { Repository: 'redis', Tag: '7-alpine', ID: 'sha256:fedcba0987654321', Size: '35 MB', CreatedAt: '2025-05-10T00:00:00Z' },
  { Repository: 'node', Tag: '20-alpine', ID: 'sha256:0987654321abcdef', Size: '180 MB', CreatedAt: '2025-08-01T00:00:00Z' },
]

export const mockNetworks: DockerNetwork[] = [
  { ID: 'net1', Name: 'bridge', Driver: 'bridge', Scope: 'local' },
  { ID: 'net2', Name: 'web_default', Driver: 'bridge', Scope: 'local' },
  { ID: 'net3', Name: 'host', Driver: 'host', Scope: 'local' },
]

export const mockVolumes: DockerVolume[] = [
  { Name: 'postgres_data', Driver: 'local' },
  { Name: 'redis_data', Driver: 'local' },
]
