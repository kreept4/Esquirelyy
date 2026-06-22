import { composioPing } from './adapter'

export class ComposioBridge {

  async healthCheck() {
    return await composioPing()
  }

}
