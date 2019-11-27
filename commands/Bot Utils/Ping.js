const Command = require('../../core/Command')

module.exports = class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      category: 'Bot Utils',
      description: 'Check discord latency.',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils
    const { createdTimestamp } = msg

    // * ------------------ Logic --------------------

    return standardMessage(msg, `Pong! Your ping is ${Date.now() - createdTimestamp} ms`)
  }
}
