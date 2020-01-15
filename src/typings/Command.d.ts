/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { PermissionResolvable } from 'discord.js'

interface CommandData {
  name: string
  category: string
  description: string
  aliases?: string[]
  args?: boolean
  webUI?: boolean
  usage?: string[]
  guildOnly?: boolean
  ownerOnly?: boolean
  permsNeeded?: PermissionResolvable[]
  disabled?: boolean
}
