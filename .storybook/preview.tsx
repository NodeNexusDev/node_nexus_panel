import type { Preview } from '@storybook/react'
import '../src/index.css'

export const globalTypes = {
  theme: {
    description: 'Global theme',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'circlehub',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
    a11y: { test: 'error' },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.theme === 'dark'
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return <Story />
    },
  ],
}

export default preview
