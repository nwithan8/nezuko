/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'
import { get, post } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/*
requires role "requestmovie"
*/

export default class OmbiMovies extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'movie',
      category: 'Media',
      description: 'Search and request movies via Ombi',
      usage: [`movie <Movie Name>`, `movie tmdb:603`],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client
    const { errorMessage, warningMessage, missingConfig, standardMessage, embed, paginate } = Utils
    const { author, channel, member } = msg

    const role = msg.guild.roles.find((r) => r.name === 'requestmovie')
    if (!role) {
      await msg.guild.createRole({ name: 'requestmovie' })
      return channel.send(
        Utils.embed(msg, 'yellow')
          .setTitle('Missing role [ requestmovie ]')
          .setDescription(
            'I created a role called **requestmovie**. Assign this role to members to let them request movies!'
          )
      )
    }

    // * ------------------ Config --------------------

    const { host, apiKey, username } = client.db.config.ombi

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !username) {
      const settings = [
        `${p}config set ombi host <http://ip>`,
        `${p}config set ombi apiKey <APIKEY>`,
        `${p}config set ombi username <USER>`
      ]
      return missingConfig(msg, 'ombi', settings)
    }

    // * ------------------ Logic --------------------

    const outputMovie = (movie) => {
      const e = embed(msg, 'green', 'ombi.png')
        .setTitle(`${movie.title} ${movie.releaseDate ? `(${movie.releaseDate.split('T')[0].substring(0, 4)})` : ''}`)
        .setDescription(`${movie.overview.substring(0, 255)}(...)`)
        .setThumbnail(`https://image.tmdb.org/t/p/w500${movie.posterPath}`)
        .setURL(`https://www.themoviedb.org/movie/${movie.theMovieDbId}`)

      if (movie.available) e.addField('Available', '✅', true)
      if (movie.quality) e.addField('Quality', movie.quality, true)
      if (movie.requested) e.addField('Requested', '✅', true)
      if (movie.approved) e.addField('Approved', '✅', true)
      if (movie.plexUrl) e.addField('Plex', `[Watch now](${movie.plexUrl})`, true)
      if (movie.embyUrl) e.addField('Emby', `[Watch now](${movie.embyUrl})`, true)

      return e
    }
    const getTMDbID = async (name) => {
      try {
        const response = await get(urljoin(host, '/api/v1/Search/movie/', name)).headers({
          accept: 'application/json',
          ApiKey: apiKey,
          'User-Agent': `Mellow/${process.env.npm_package_version}`
        })
        return response.body
      } catch (e) {
        const text = 'Failed to connect to Ombi'
        Log.error('Ombi Movies', text, e)
        await errorMessage(msg, text)
      }
    }

    const requestMovie = async (movie) => {
      if (!member.roles.some((r) => r.name === 'requestmovie')) {
        return warningMessage(msg, 'You must be part of the [ `requestmovie` ] role to request movies.')
      }

      if (movie.available) {
        return warningMessage(msg, `[ ${movie.title} ] is already available in Ombi`)
      }

      if (movie.approved) {
        return warningMessage(msg, `[ ${movie.title} ] is already approved in Ombi`)
      }

      if (movie.requested) {
        return warningMessage(msg, `[ ${movie.title} ] is already requested in Ombi`)
      }

      if (!movie.available && !movie.requested && !movie.approved) {
        try {
          await post(urljoin(host, '/api/v1/Request/movie/'))
            .headers({
              accept: 'application/json',
              'Content-Type': 'application/json',
              ApiKey: apiKey,
              ApiAlias: `${author.username}#${author.discriminator}`,
              UserName: username || undefined
            })
            .send({ theMovieDbId: movie.theMovieDbId })

          return standardMessage(msg, `Requested [ ${movie.title} ] in Ombi.`)
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Log.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }
    }

    // * ------------------ Usage Logic --------------------

    const movieName = args.join(' ')

    if (!movieName) return warningMessage(msg, `Please enter a valid TV show name!`)

    const results = await getTMDbID(movieName)

    if (results.length) {
      const embedList = []
      for (const movie of results) {
        try {
          const response = await get(urljoin(host, '/api/v1/Search/movie/info/', String(movie.id))).headers({
            ApiKey: apiKey,
            accept: 'application/json'
          })
          const data = response.body
          embedList.push(outputMovie(data))
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Log.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }

      const itemPicked = await paginate(msg, embedList, true)
      return requestMovie(results[itemPicked])
    }
  }
}
