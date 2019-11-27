const { exec } = require('shelljs')
const Command = require('../../core/Command')

module.exports = class ArchiveBox extends Command {
  constructor(client) {
    super(client, {
      name: 'archive',
      category: 'Utils',
      description: 'Archive web pages with ArchiveBox',
      usage: ['a <url to archive>'],
      aliases: ['a'],
      args: true,
      webUI: false
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { standardMessage, errorMessage } = Utils

    // * ------------------ Logic --------------------
    await standardMessage(
      msg,
      `:printer: Archiving the url\n\n- ${args[0]}\n\n:hourglass: This may take some time...`
    )

    exec(
      `cd ~/git/ArchiveBox && echo "${args[0]}" | ./archive`,
      { silent: false },
      async (code) => {
        if (code !== 0) {
          return errorMessage(msg, `Failed to archive [ ${args[0]} ]`)
        }
        return standardMessage(msg, `Archive of [ ${args[0]} ] complete!`)
      }
    )
  }
}
