import { nodeHandlers } from './nodes'
import { commandHandlers } from './commands'
import { scriptHandlers } from './scripts'
import { dashboardHandlers } from './dashboard'
import { apiKeyHandlers } from './api-keys'
import { dockerHandlers } from './docker'
import { auditHandlers } from './audit'
import { searchHandlers } from './search'
import { favoritesHandlers } from './favorites'
import { notesHandlers } from './notes'
import { configHandlers } from './config'
import { eventsHandlers } from './events'

export const handlers = [
  ...nodeHandlers,
  ...commandHandlers,
  ...scriptHandlers,
  ...dashboardHandlers,
  ...apiKeyHandlers,
  ...dockerHandlers,
  ...auditHandlers,
  ...searchHandlers,
  ...favoritesHandlers,
  ...notesHandlers,
  ...configHandlers,
  ...eventsHandlers,
]
