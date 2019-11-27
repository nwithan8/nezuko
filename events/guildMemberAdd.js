const { RichEmbed } = require('discord.js')
const { client } = require('../index')

client.on('guildMemberAdd', async (member) => {
  const { colors, db } = client

  const { prefix, welcomeChannel } = db.server

  const embed = new RichEmbed()
    .setColor(colors.green)
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Welcome To ${member.guild.name}!`)
    .setDescription(
      `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
    )
  const channel = member.guild.channels.get(welcomeChannel)
  return channel.send({ embed })
})
