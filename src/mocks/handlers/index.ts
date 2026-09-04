import { nodeHandlers } from './nodes'
import { commandHandlers } from './commands'
import { scriptHandlers } from './scripts'
import { dashboardHandlers } from './dashboard'
import { apiKeyHandlers } from './api-keys'
import { dockerHandlers } from './docker'
import { composeHandlers } from './compose'
import { auditHandlers } from './audit'
import { searchHandlers } from './search'
import { favoritesHandlers } from './favorites'
import { configHandlers } from './config'
import { eventsHandlers } from './events'
import { healthHandlers } from './health'
import { authHandlers } from './auth'
import { userHandlers } from './users'
import { templatesHandlers } from './templates'

export const handlers = [
  ...authHandlers,
  ...nodeHandlers,
  ...commandHandlers,
  ...scriptHandlers,
  ...dashboardHandlers,
  ...apiKeyHandlers,
  ...dockerHandlers,
  ...composeHandlers,
  ...auditHandlers,
  ...searchHandlers,
  ...favoritesHandlers,
  ...configHandlers,
  ...eventsHandlers,
  ...healthHandlers,
  ...userHandlers,
  ...templatesHandlers,
]
