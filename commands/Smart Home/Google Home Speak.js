const Command = require('../../core/Command')
const { Device } = require('google-home-notify-client')
const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

class GoogleHomeSpeak extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: `${prefix}say <msg>`,
      aliases: ['speak'],
      args: true,
      ownerOnly: true,
      webUI: true
    })
  }

  async run(msg, args, api) {
    // -------------------------- Setup --------------------------
    const logger = this.client.logger

    // ------------------------- Config --------------------------

    const { ip, name, language, accent } = this.client.config.commands.googleHome

    // ----------------------- Main Logic ------------------------

    /**
     * send text to Google Home to TTS
     * @param {String} speach text to have spoken
     * @returns {String} success / no connection
     */
    const googleSpeak = async (speach) => {
      try {
        const device = new Device(ip, name, language, accent)
        await device.notify(speach)
        return 'success'
      } catch (error) {
        logger.warn(error)
        return 'no connection'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const command = args.join(' ')
    const status = await googleSpeak(command)
    const embed = new Discord.RichEmbed()

    if (!api) embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)

    if (status === 'success') {
      if (api) return `Told Google Home to say: ${command}`
      embed.setTitle(`Told Google Home to say: **${command}**`)
      return msg.channel.send({ embed })
    } else {
      if (api) return 'No connection to Google Home.'
      embed.setTitle('No connection to Google Home.')
      return msg.channel.send({ embed })
    }
  }
}
module.exports = GoogleHomeSpeak
