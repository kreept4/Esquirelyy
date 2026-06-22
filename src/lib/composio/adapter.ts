import { composio } from './index'

export async function composioPing() {
  try {
    return {
      ok: true,
      message: 'Composio adapter is active'
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Unknown error'
    }
  }
}
