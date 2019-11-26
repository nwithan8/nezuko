const Command = require('../../core/Command')

class Shortcut extends Command {
  constructor(client) {
    super(client, {
      name: 'shortcut',
      aliases: ['s'],
      category: 'Utils',
      usage: ['s list', 's add <name> <command>', 's remove <name>'],
      description: 'Shortcut to run specific commands',
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig } = client
    const { warningMessage, standardMessage, errorMessage, embed } = Utils

    // * ------------------ Config --------------------

    const config = await generalConfig.findOne({
      where: { id: msg.author.id }
    })
    const shortcuts = JSON.parse(config.dataValues.shortcuts)

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        if (!shortcuts.length) return warningMessage(msg, `There are no shortcuts!`)

        let todoList = ''
        shortcuts.forEach((i) => {
          todoList += `**${i.name} - ${i.command} ${i.arg.join(' ')}**\n`
        })
        return msg.reply(
          embed(msg, 'green')
            .setTitle('Shortcuts')
            .setDescription(todoList)
        )
      }
      case 'add': {
        const name = args[1]
        const command = args[2]
        const index = shortcuts.findIndex((i) => i.name === name)

        if (index > -1) return warningMessage(msg, `Shortcut [ ${name} ] already exists`)

        args.splice(0, 3)
        const arg = args.join(' ')
        shortcuts.push({ name, command, arg: arg.split(' ') })
        await config.update({ shortcuts: JSON.stringify(shortcuts) })
        return standardMessage(msg, `${name}\n\nAdded to shortcut list`)
      }
      case 'remove': {
        const name = args[1]
        const index = shortcuts.findIndex((d) => d.name === name)
        if (index === -1) return warningMessage(msg, `Shortcut does not exist`)

        shortcuts.splice(index, 1)
        await config.update({ shortcuts: JSON.stringify(shortcuts) })
        if (name) return standardMessage(msg, `${name}\n\nRemoved from shortcut list`)

        break
      }
      default: {
        const index = shortcuts.findIndex((i) => i.name === args[0])
        if (index === -1) return warningMessage(msg, `Shortcut does not exist`)

        const { command, arg } = shortcuts[index]

        const cmd = msg.context.findCommand(command)
        if (cmd) return msg.context.runCommand(client, cmd, msg, arg)
        return errorMessage(msg, `Command [ ${command} ] does not exist`)
      }
    }
  }
}

module.exports = Shortcut