export const CONNECTION_TYPE_OPTIONS = [
  { value: 'ssh' as const, label: 'SSH' },
  { value: 'docker' as const, label: 'SSH + Docker' },
  { value: 'proxmox' as const, label: 'Proxmox' },
]

export type ConnectionType = typeof CONNECTION_TYPE_OPTIONS[number]['value']
