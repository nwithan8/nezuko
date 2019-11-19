// todo change to list external and internal ip's
const fetch = require('node-fetch')
const Command = require('../../../core/Command')

class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking Tools',
      description: 'Show Server IP',
      usage: `ip <external/local>`,
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    const { Utils } = client
    const { author, channel } = msg

    const embed = Utils.embed(msg)
    if (!api) {
      embed.setFooter(`Requested by: ${author.username}`, author.avatarURL)
    }

    const response = await fetch('https://ifconfig.co/json')
    const data = await response.json()
    embed.setTitle(`${data.ip}`)
    return channel.send({ embed }).then((m) => m.delete(10000))
  }
}
module.exports = SystemIP
