import { Handler } from '@netlify/functions'
import { Db, ObjectId } from 'mongodb'
import { Api, env, getClient } from '../utilities'
import { EventPlayerResponse, EventResponse, SeasonResponse } from '@/models'

export const handler: Handler = Api('GET', 'events-balance/:eventId', ([eventId]) => async () => {
  const client = await getClient()

  try {
    const db = client.db(env().mongodbName)
    const eventData = await getEventData(db, eventId)

    if (!eventData) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ctpPennyBalance: 0, acePennyBalance: 0 }),
      }
    }

    const { season, eventPlayers, ...event } = eventData

    const ctpPennyBalance = calculateCtpBalance(event, season, eventPlayers)
    const acePennyBalance = calculateAceBalance(event, season, eventPlayers)

    return {
      statusCode: 200,
      body: JSON.stringify({ ctpPennyBalance, acePennyBalance }),
    }
  } finally {
    await client.close()
  }
})

type EventWithSeasonAndPlayers = EventResponse & { season: SeasonResponse, eventPlayers: EventPlayerResponse[] }

async function getEventData(db: Db, eventId: string): Promise<EventWithSeasonAndPlayers | undefined> {
  const collection = db.collection<EventResponse>('events')

  const [eventData] = await collection.aggregate([
    { $match: { _id: new ObjectId(eventId) } },
    {
      $addFields: {
        seasonIdObjectId: { $toObjectId: '$seasonId' },
        eventIdString: { $toString: '$_id' },
      },
    },
    {
      $lookup: {
        from: 'seasons',
        localField: 'seasonIdObjectId',
        foreignField: '_id',
        as: 'season',
      },
    },
    {
      $addFields: {
        season: { $first: '$season' },
      },
    },
    {
      $lookup: {
        from: 'event-players',
        localField: 'eventIdString',
        foreignField: 'eventId',
        as: 'eventPlayers',
      },
    },
    { $sort: { completed: -1 } },
    { $limit: 1 },
  ]).toArray()

  return eventData as EventWithSeasonAndPlayers | undefined
}

function calculateCtpBalance(event: EventResponse, season: SeasonResponse, eventPlayers: EventPlayerResponse[]): number {
  if (event.ctpPlayerIds?.length) {
    return 0
  }

  return eventPlayers.reduce((sum, eventPlayer) => {
    if (eventPlayer.inForCtp && season.ctpInPennies) {
      sum += season.ctpInPennies
    }

    return sum
  }, event.ctpPennyBalance ?? 0)
}

function calculateAceBalance(event: EventResponse, season: SeasonResponse, eventPlayers: EventPlayerResponse[]): number {
  if (event.acePlayerIds?.length) {
    return 0
  }

  return eventPlayers.reduce((sum, eventPlayer) => {
    if (eventPlayer.inForAce && season.aceInPennies) {
      sum += season.aceInPennies
    }

    return sum
  }, event.acePennyBalance ?? 0)
}