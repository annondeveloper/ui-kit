import type { Preview } from '@storybook/react'

import '../src/core/tokens/theme.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'hsl(222 47% 7%)' },
        { name: 'light', value: 'hsl(210 40% 98%)' },
      ],
    },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const bg = context.globals?.backgrounds?.value
      const isLight = bg === 'hsl(210 40% 98%)'
      return (
        <div className={isLight ? 'light' : ''} style={{ padding: '1rem' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
