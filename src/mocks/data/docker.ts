import type { DockerContainer, DockerImage, DockerNetwork, DockerVolume } from '../../api/types'

export const mockContainers: DockerContainer[] = [
  {
    id: 'c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
    name: 'nginx-proxy',
    image: 'nginx:1.25-alpine',
    state: 'running',
    status: 'running',
    created: '2025-08-10T14:30:00Z',
    ports: [{ host_port: 80, container_port: 80, protocol: 'tcp' }, { host_port: 443, container_port: 443, protocol: 'tcp' }],
    labels: { 'com.docker.compose.project': 'web' },
  },
  {
    id: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    name: 'postgres-main',
    image: 'postgres:16-alpine',
    state: 'running',
    status: 'running',
    created: '2025-07-20T10:00:00Z',
    ports: [{ host_port: 5432, container_port: 5432, protocol: 'tcp' }],
    labels: {},
  },
  {
    id: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    name: 'redis-cache',
    image: 'redis:7-alpine',
    state: 'stopped',
    status: 'exited',
    created: '2025-08-01T08:15:00Z',
    ports: [{ host_port: 6379, container_port: 6379, protocol: 'tcp' }],
    labels: {},
  },
  {
    id: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    name: 'app-worker',
    image: 'node:20-alpine',
    state: 'running',
    status: 'running',
    created: '2025-08-15T12:00:00Z',
    ports: [],
    labels: { 'com.docker.compose.project': 'backend' },
  },
]

export const mockImages: DockerImage[] = [
  { id: 'sha256:1234567890abcdef', tag: 'nginx:1.25-alpine', size_bytes: 42_000_000, created: '2025-07-15T00:00:00Z', labels: {} },
  { id: 'sha256:abcdef1234567890', tag: 'postgres:16-alpine', size_bytes: 280_000_000, created: '2025-06-01T00:00:00Z', labels: {} },
  { id: 'sha256:fedcba0987654321', tag: 'redis:7-alpine', size_bytes: 35_000_000, created: '2025-05-10T00:00:00Z', labels: {} },
  { id: 'sha256:0987654321abcdef', tag: 'node:20-alpine', size_bytes: 180_000_000, created: '2025-08-01T00:00:00Z', labels: {} },
]

export const mockNetworks: DockerNetwork[] = [
  { id: 'net1', name: 'bridge', driver: 'bridge', created: '2025-01-01T00:00:00Z', containers: ['c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6'] },
  { id: 'net2', name: 'web_default', driver: 'bridge', created: '2025-08-10T00:00:00Z', containers: ['c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9'] },
  { id: 'net3', name: 'host', driver: 'host', created: '2025-01-01T00:00:00Z', containers: [] },
]

export const mockVolumes: DockerVolume[] = [
  { name: 'postgres_data', driver: 'local', mountpoint: '/var/lib/docker/volumes/postgres_data/_data', created: '2025-07-20T00:00:00Z' },
  { name: 'redis_data', driver: 'local', mountpoint: '/var/lib/docker/volumes/redis_data/_data', created: '2025-08-01T00:00:00Z' },
]
