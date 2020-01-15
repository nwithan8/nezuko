/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Invite extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'invite',
      category: 'General',
      description: 'Invite Nezuko to your own server'
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { embed } = client.Utils
    const { channel } = msg

    // * ------------------ Logic --------------------

    const invite = await client.generateInvite([
      'MANAGE_MESSAGES',
      'CREATE_INSTANT_INVITE',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'MANAGE_CHANNELS',
      'MANAGE_GUILD',
      'MANAGE_MESSAGES',
      'MANAGE_ROLES'
    ])

    return channel.send(
      embed(msg, 'green')
        .setTitle('Nezuko')
        .setDescription('Thanks for showing interest in Nezuko! Click the link below to invite her to your server.')
        .setThumbnail(client.user.avatarURL)
        .addField('\u200b', `[Click Here](${invite})`)
    )
  }
}
