export const CONNECTION_TYPE_OPTIONS = [
  { value: 'ssh' as const, label: 'SSH' },
]

export type ConnectionType = typeof CONNECTION_TYPE_OPTIONS[number]['value']
