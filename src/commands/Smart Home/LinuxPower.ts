/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'
import { post } from 'unirest'
import wol from 'wol'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class LinuxPower extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'pc',
      category: 'Smart Home',
      description: 'Linux system power control',
      usage: [`system gaara off`, `pc thinkboi reboot`],
      webUI: true,
      args: true,
      ownerOnly: true
    })
  }

  // TODO add linuxpower typings
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------

    const { Utils, Log } = client
    const { errorMessage, validOptions, standardMessage, embed, capitalize } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const devices = client.db.config.systemPowerControl

    // * ------------------ Logic --------------------

    const sendCommand = async (device: { host: string; mac: string; name: string }, command: string) => {
      const { host, mac, name } = device

      const options = ['reboot', 'off', 'on']
      if (!options.includes(command)) {
        if (api) return `Valid commands are [ ${options.join(', ')} ]`
        await validOptions(msg, options)
      } else {
        switch (command) {
          case 'reboot':
          case 'off': {
            try {
              const response = await post(host)
                .headers({ 'Content-Type': 'application/json' })
                .send({ command })

              const statusCode = response.status

              if (statusCode === 200) {
                const text = command === 'reboot' ? 'reboot' : 'power off'
                if (api) return `Told [ ${capitalize(name)} ] to [ ${text} ]`
                return standardMessage(msg, `:desktop: Told [ ${capitalize(name)} ] to [ ${text}] `)
              }
            } catch (e) {
              if (api) return `Failed to connect to ${capitalize(name)}`
              Log.error('System Power Control', `Failed to connect to [ ${capitalize(name)} ]`, e)
              await errorMessage(msg, `Failed to connect to [ ${capitalize(name)} ]`)
            }
          }
          case 'on': {
            await wol.wake(mac)
            if (api) return `Sent WOL to [ ${capitalize(name)} ]`
            return standardMessage(msg, `:desktop: Sent WOL to [ ${capitalize(name)} ]`)
          }
        }
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        // Todo add listing functionality
        return channel.send(embed(msg, 'green'))
      }

      default: {
        const system = args[0]
        const command = args[1]
        const index = devices.findIndex((d) => d.name === system)
        const host = devices[index]
        return sendCommand(host, command)
      }
    }
  }
}
