/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Get and set server config
 */
export default class Config extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'server',
      category: 'Admin',
      description: 'Set/Get server config for bot',
      usage: ['server get', 'server set <key> <value'],
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    // * ------------------ Config --------------------

    const db = await database.models.ServerConfig.findOne({ where: { id: guild.id } })

    const server = JSON.parse(db.get('config') as string) as ServerDBConfig

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      // Get the current server settings
      case 'get': {
        // Remove the server rules key to remove bloat from
        // The info embed
        delete server.rules

        // Sort keys
        const keys = Object.keys(server).sort()

        // Info embed
        const e = embed(msg, 'green', 'settings.png')
          .setTitle('Server Config')
          .setDescription(`**[ ${p}server set <settings> <new value> ] to change**`)

        // Add a new field to the embed for every key in the settings
        keys.forEach((i) => e.addField(`${i}`, `${server[i] ? server[i] : 'unset'}`, true))

        // Ship it off
        return channel.send(e)
      }
      // Set server settings
      case 'set': {
        // Setting to change
        const keyToChange = args[1] as string
        // New value
        const newValue = args[2] as string

        // If the setting exists
        if (keyToChange in server) {
          // Change key to new one
          server[keyToChange] = newValue
          // Update the database
          await db.update({ config: JSON.stringify(server) })
          // Notify the user
          return standardMessage(msg, `[ ${keyToChange} ] changed to [ ${newValue} ]`)
        } // If the setting doesnt exist
        return warningMessage(msg, `[${keyToChange}] doesnt exist`)
      }
      // If neither 'set' or 'get' where specified as options inform the user
      // Of the correct options
      default:
        return validOptions(msg, ['get', 'set'])
    }
  }
}
