/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { ExecAsync, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Executor extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'exec',
      category: 'Owner',
      description: 'Run shell commands',
      ownerOnly: true,
      args: true,
      usage: ['exec <command>']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { channel } = msg
    const { execAsync } = client.Utils

    // * ------------------ Usage Logic --------------------

    const regex = new RegExp(
      client.config.token
        .replace(/\./g, '\\.')
        .split('')
        .join('.?'),
      'g'
    )

    const input = `📥 **Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``
    const error = (err) => `🚫 **Error:**\n\`\`\`sh\n${err.toString().replace(regex, '[Token]')}\n\`\`\``

    const { stdout, stderr } = (await execAsync(args.join(' '), { silent: false })) as ExecAsync

    if (stderr) {
      try {
        return channel.send(`${input}\n${error(stderr)}`)
      } catch (err) {
        return channel.send(`${input}\n${error(err)}`)
      }
    }

    const response = `📤 **Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``
    try {
      return channel.send(`${input}\n${response}`, { split: true })
    } catch (err) {
      return channel.send(`${input}\n${error(err)}`)
    }
  }
}
