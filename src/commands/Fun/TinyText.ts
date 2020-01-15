/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'

const mappings = ((object) => {
  const output = []

  for (const key in object) {
    output.push({
      regex: new RegExp(key, 'ig'),
      replacement: object[key]
    })
  }

  return output
})({
  a: '\u1D00',
  b: '\u0299',
  c: '\u1D04',
  d: '\u1D05',
  e: '\u1D07',
  f: '\uA730',
  g: '\u0262',
  h: '\u029C',
  i: '\u026A',
  j: '\u1D0A',
  k: '\u1D0B',
  l: '\u029F',
  m: '\u1D0D',
  n: '\u0274',
  o: '\u1D0F',
  p: '\u1D18',
  q: '\u0071',
  r: '\u0280',
  s: '\uA731',
  t: '\u1D1B',
  u: '\u1D1C',
  v: '\u1D20',
  w: '\u1D21',
  x: '\u0078',
  y: '\u028F',
  z: '\u1D22'
})

export default class TinyTtext extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'tiny',
      category: 'Fun',
      description: 'Makes text tiny for dramatic effect',
      usage: ['tiny <text>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], _api: boolean) {
    // * ------------------ Setup --------------------
    const { channel } = msg
    const { embed } = client.Utils

    // * ------------------ Usage Logic --------------------

    let output = args.join(' ')

    mappings.forEach((replacer) => (output = output.replace(replacer.regex, replacer.replacement)))

    return channel.send(output)
  }
}
