import { nodeHandlers } from './nodes'
import { commandHandlers } from './commands'
import { scriptHandlers } from './scripts'
import { dashboardHandlers } from './dashboard'
import { apiKeyHandlers } from './api-keys'

export const handlers = [
  ...nodeHandlers,
  ...commandHandlers,
  ...scriptHandlers,
  ...dashboardHandlers,
  ...apiKeyHandlers,
]
