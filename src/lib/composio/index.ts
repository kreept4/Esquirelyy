import { Composio } from '@composio/core'

const apiKey = process.env.COMPOSIO_API_KEY

if (!apiKey) {
  throw new Error('Missing COMPOSIO_API_KEY')
}

// server-only guard
if (typeof window !== 'undefined') {
  throw new Error('Composio must only run on server')
}

export const composio = new Composio({
  apiKey
})
